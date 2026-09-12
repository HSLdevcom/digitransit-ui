/* eslint-disable no-console, no-unused-vars, prefer-destructuring, consistent-return */

import { Issuer, Strategy, custom } from 'openid-client';
import util from 'util';
import process from 'process';
import { User } from './User.js';

const debugLogging = process.env.DEBUGLOGGING;
const callbackPath = '/oid_callback';

const OICStrategy = function strategy(config) {
  this.name = 'passport-openid-connect';
  this.config = config || {};
  this.client = null;
  this.init().then(() => {
    console.log(
      'Initialization of OpenID Connect discovery process completed.',
    );
  });
};

util.inherits(OICStrategy, Strategy);

custom.setHttpOptionsDefaults({
  timeout: 10000,
});

OICStrategy.prototype.init = function init() {
  if (!this.config.issuerHost) {
    throw new Error(
      'Could not find requried config options issuerHost in openid-passport strategy initalization',
    );
  }
  console.log('OIDC: discover');
  return Issuer.discover(this.config.issuerHost)
    .then(issuer => {
      this.client = new issuer.Client(this.config);
      this.client[custom.clock_tolerance] = 30;
    })
    .catch(err => {
      console.log('OpenID Connect discovery failed');
      console.error('OIDC error: ', err);
      process.abort();
    });
};

OICStrategy.prototype.authenticate = function auth(req, opts) {
  const redirectUri = this.createRedirectUrl(req);
  if (opts.callback) {
    if (debugLogging) {
      console.log('calling auth callback');
    }
    return this.callback(req, opts);
  }
  if (opts.refresh) {
    return this.refresh(req);
  }
  const cookieLang = req.cookies.lang || 'fi';
  const { ssoValidTo, ssoToken } = req.session;
  const authurl =
    ssoValidTo && ssoValidTo > Math.floor(new Date().getTime() / 1000)
      ? this.createAuthUrl(redirectUri, cookieLang, ssoToken)
      : this.createAuthUrl(redirectUri, cookieLang);
  if (debugLogging) {
    console.log(`ssoToken: ${ssoToken} authUrl: ${authurl}`);
  }
  this.redirect(authurl);
};

// NOTE: tokenSet/userinfo must never be stored on `this` (the strategy
// instance is a singleton shared by every concurrent request). Doing so
// previously caused a race condition where one user's async callback could
// read back another user's tokenSet/userinfo, logging them in as the wrong
// person. Always thread these values through the promise chain as local
// arguments instead.
OICStrategy.prototype.getUserInfo = function getuinfo(tokenSet) {
  if (debugLogging) {
    console.log('passport getUserInfo');
  }
  return this.client.userinfo(tokenSet.access_token).then(userinfo => {
    if (debugLogging) {
      console.log(`got userInfo: ${JSON.stringify(userinfo)}`);
    }
    return userinfo;
  });
};

OICStrategy.prototype.callback = function cb(req, opts) {
  if (debugLogging) {
    console.log(`path=${req.path} query=${req.query}`);
  }
  const redirectUri = this.createRedirectUrl(req);
  return this.client
    .callback(redirectUri, req.query, {
      state: req.query.state,
    })
    .then(tokenSet => {
      req.session.ssoToken = null;
      req.session.ssoValidTo = null;
      if (debugLogging) {
        console.log(`got tokenSet: ${JSON.stringify(tokenSet)}`);
      }
      return this.getUserInfo(tokenSet).then(userinfo => ({
        tokenSet,
        userinfo,
      }));
    })
    .then(({ tokenSet, userinfo }) => {
      const user = new User(userinfo);
      user.token = tokenSet;
      user.idtoken = tokenSet.claims;
      if (debugLogging) {
        console.log(`set user: ${JSON.stringify(user)}`);
      }
      if (this.config.sessionCallback) {
        this.config.sessionCallback(user.data.sub, req.session.id);
      }
      this.success(user);
    })
    .catch(err => {
      console.error('Error processing callback', err);
      req.session.ssoToken = null;
      req.session.ssoValidTo = null;
      this.fail(err);
    });
};

OICStrategy.prototype.refresh = function refresh(req) {
  if (debugLogging) {
    console.log('Refreshing tokens');
  }
  return this.client
    .refresh(req.user.token.refresh_token)
    .then(tokenSet => {
      if (debugLogging) {
        console.log(`got tokenSet: ${JSON.stringify(tokenSet)}`);
      }
      return this.getUserInfo(tokenSet).then(userinfo => ({
        tokenSet,
        userinfo,
      }));
    })
    .then(({ tokenSet, userinfo }) => {
      const user = new User(userinfo);
      user.token = tokenSet;
      user.idtoken = tokenSet.claims;
      if (debugLogging) {
        console.log(`set user: ${JSON.stringify(user)}`);
      }
      this.success(user);
    })
    .catch(err => {
      console.error('Error refreshing tokens', err);
      req.logout({}, () => {
        req.session.destroy();
        this.fail(err);
      });
    });
};
OICStrategy.prototype.createAuthUrl = function createAuthUrl(
  redirectUri,
  lang,
  ssoToken,
) {
  if (debugLogging) {
    console.log(`createAuthUrl, ssotoken=${JSON.stringify(ssoToken)}`);
  }
  const params = {
    response_type: 'code',
    client_id: this.config.client_id,
    redirect_uri: redirectUri,
    scope: this.config.scope,
    state: process.hrtime()[1],
    ui_locales: lang,
  };
  if (ssoToken) {
    return this.client.authorizationUrl({
      ...params,
      sso_token: ssoToken,
      prompt: 'none',
    });
  }
  return this.client.authorizationUrl(params);
};

OICStrategy.prototype.createRedirectUrl = function createRedirectUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (req.secure) {
    return `https://${host}${callbackPath}`;
  }
  return `http://${host}${callbackPath}`;
};

OICStrategy.serializeUser = function serializeUser(user, cb) {
  cb(null, user.serialize());
};

OICStrategy.deserializeUser = function deserializeUser(packed, cb) {
  cb(null, User.unserialize(packed));
};

export { OICStrategy as Strategy };
