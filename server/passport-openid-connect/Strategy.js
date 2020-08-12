/* eslint-disable func-names */
/* eslint-disable no-console, strict, no-unused-vars, prefer-destructuring, consistent-return */

'use strict';

const openid = require('openid-client');
const passport = require('passport');
const util = require('util');
const User = require('./User').User;

const OICStrategy = function(config) {
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

util.inherits(OICStrategy, passport.Strategy);

openid.Issuer.defaultHttpOptions.timeout = 5000;

OICStrategy.prototype.init = function() {
  if (!this.config.issuerHost) {
    throw new Error(
      'Could not find requried config options issuerHost in openid-passport strategy initalization',
    );
  }
  return Promise.resolve()
    .then(() => {
      return openid.Issuer.discover(this.config.issuerHost);
    })
    .then(issuer => {
      this.client = new issuer.Client(this.config);
      this.client.CLOCK_TOLERANCE = 30;
    })
    .catch(err => {
      console.error('ERROR', err);
    });
};

OICStrategy.prototype.authenticate = function(req, opts) {
  if (opts.callback) {
    return this.callback(req);
  }
  const authurl = this.createAuthUrl(req.session.ssoToken);
  this.redirect(authurl);
};

OICStrategy.prototype.getUserInfo = function() {
  return this.client.userinfo(this.tokenSet.access_token).then(userinfo => {
    this.userinfo = userinfo;
  });
};

OICStrategy.prototype.callback = function(req) {
  return this.client
    .authorizationCallback(this.config.redirect_uri, req.query, {
      state: req.query.state,
    })
    .then(tokenSet => {
      this.tokenSet = tokenSet;
      return this.getUserInfo();
    })
    .then(() => {
      const user = new User(this.userinfo);
      user.token = this.tokenSet;
      user.idtoken = this.tokenSet.claims;
      this.success(user);
    })
    .catch(err => {
      console.error('Error processing callback', err);
      this.fail(err);
    });
};

OICStrategy.prototype.createAuthUrl = function(ssoToken) {
  const params = {
    response_type: 'code',
    client_id: this.config.client_id,
    redirect_uri: this.config.redirect_uri,
    scope: this.config.scope,
    state: process.hrtime()[1],
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

OICStrategy.serializeUser = function(user, cb) {
  cb(null, user.serialize());
};

OICStrategy.deserializeUser = function(packed, cb) {
  cb(null, User.unserialize(packed));
};

exports.Strategy = OICStrategy;
