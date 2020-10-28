/* eslint-disable no-console, strict, no-unused-vars, prefer-destructuring, consistent-return */

'use strict';

const { Issuer, Strategy, custom } = require('openid-client');
const moment = require('moment');
const util = require('util');
const process = require('process');
const User = require('./User').User;

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
      console.log('OIDC: create client');
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
  if (opts.callback) {
    console.log('calling auth callback');
    return this.callback(req, opts);
  }
  const { ssoValidTo, ssoToken } = req.session;
  const authurl =
    ssoValidTo && ssoValidTo > moment().unix()
      ? this.createAuthUrl(ssoToken)
      : this.createAuthUrl();
  console.log(`ssoToken: ${ssoToken} authUrl: ${authurl}`);
  this.redirect(authurl);
};

OICStrategy.prototype.getUserInfo = function () {
  console.log('passport getUserInfo');
  return this.client.userinfo(this.tokenSet.access_token).then(userinfo => {
    this.userinfo = userinfo;
    console.log(`got userInfo: ${JSON.stringify(userinfo)}`);
  });
};

OICStrategy.prototype.callback = function (req, opts) {
  console.log(`path=${req.path} query=${req.query}`);
  return this.client
    .callback(this.config.redirect_uri, req.query, {
      state: req.query.state,
    })
    .then(tokenSet => {
      req.session.ssoToken = null;
      req.session.ssoValidTo = null;
      this.tokenSet = tokenSet;
      console.log(`got tokenSet: ${JSON.stringify(tokenSet)}`);
      return this.getUserInfo();
    })
    .then(() => {
      const user = new User(this.userinfo);
      user.token = this.tokenSet;
      user.idtoken = this.tokenSet.claims;
      console.log(`set user: ${JSON.stringify(user)}`);
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

OICStrategy.prototype.createAuthUrl = function (ssoToken) {
  console.log(`createAuthUrl, ssotoken=${JSON.stringify(ssoToken)}`);
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

OICStrategy.serializeUser = function (user, cb) {
  cb(null, user.serialize());
};

OICStrategy.deserializeUser = function (packed, cb) {
  cb(null, User.unserialize(packed));
};

exports.Strategy = OICStrategy;
