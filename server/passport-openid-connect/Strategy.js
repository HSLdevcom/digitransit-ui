/* eslint-disable no-console, strict, no-unused-vars, prefer-destructuring, consistent-return */

import { Issuer, Strategy, custom } from 'openid-client';
import moment from 'moment';
import util from 'util';
import process from 'process';
import { User } from './User.js';

const debugLogging = process.env.DEBUGLOGGING;
const callbackPath = '/oid_callback';

const OICStrategy = function (config) {
  this.name = 'passport-openid-connect';
  this.config = config || {};
  this.client = null;
  this.tokenSet = null;
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

OICStrategy.prototype.init = function () {
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

OICStrategy.prototype.authenticate = function (req, opts) {
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
    ssoValidTo && ssoValidTo > moment().unix()
      ? this.createAuthUrl(redirectUri, cookieLang, ssoToken)
      : this.createAuthUrl(redirectUri, cookieLang);
  if (debugLogging) {
    console.log(`ssoToken: ${ssoToken} authUrl: ${authurl}`);
  }
  this.redirect(authurl);
};

OICStrategy.prototype.getUserInfo = function () {
  if (debugLogging) {
    console.log('passport getUserInfo');
  }
  return this.client.userinfo(this.tokenSet.access_token).then(userinfo => {
    this.userinfo = userinfo;
    if (debugLogging) {
      console.log(`got userInfo: ${JSON.stringify(userinfo)}`);
    }
  });
};

OICStrategy.prototype.callback = function (req, opts) {
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
      this.tokenSet = tokenSet;
      if (debugLogging) {
        console.log(`got tokenSet: ${JSON.stringify(tokenSet)}`);
      }
      return this.getUserInfo();
    })
    .then(() => {
      const user = new User(this.userinfo);
      user.token = this.tokenSet;
      user.idtoken = this.tokenSet.claims;
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

OICStrategy.prototype.refresh = function (req) {
  if (debugLogging) {
    console.log('Refreshing tokens');
  }
  return this.client
    .refresh(req.user.token.refresh_token)
    .then(tokenSet => {
      this.tokenSet = tokenSet;
      if (debugLogging) {
        console.log(`got tokenSet: ${JSON.stringify(tokenSet)}`);
      }
      return this.getUserInfo();
    })
    .then(() => {
      const user = new User(this.userinfo);
      user.token = this.tokenSet;
      user.idtoken = this.tokenSet.claims;
      if (debugLogging) {
        console.log(`set user: ${JSON.stringify(user)}`);
      }
      this.success(user);
    })
    .catch(err => {
      console.error('Error refreshing tokens', err);
      req.logout();
      req.session.destroy();
      this.fail(err);
    });
};
OICStrategy.prototype.createAuthUrl = function (redirectUri, lang, ssoToken) {
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

OICStrategy.prototype.createRedirectUrl = function (req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (req.secure) {
    return `https://${host}${callbackPath}`;
  }
  return `http://${host}${callbackPath}`;
};

OICStrategy.serializeUser = function (user, cb) {
  cb(null, user.serialize());
};

OICStrategy.deserializeUser = function (packed, cb) {
  cb(null, User.unserialize(packed));
};

export default OICStrategy;
