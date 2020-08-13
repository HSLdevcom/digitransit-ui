/* eslint-disable func-names */
const passport = require('passport');
const session = require('express-session');
const redis = require('redis');
const request = require('request');
const RedisStore = require('connect-redis')(session);
const LoginStrategy = require('./Strategy').Strategy;

export default function setUpOIDC(app, port) {
  /* ********* Setup OpenID Connect ********* */
  const devhost = '';
  const callbackPath = '/oid_callback'; // connect callback path
  // Use Passport with OpenId Connect strategy to authenticate users
  const OIDCHost = process.env.OIDCHOST || 'https://hslid-dev.t5.fi';
  const FavouriteHost =
    process.env.FAVOURITE_HOST || 'https://dev-api.digitransit.fi/favourites';
  const RedisHost = process.env.REDIS_HOST || 'localhost';
  const RedisPort = process.env.REDIS_PORT || 6379;
  const RedisKey = process.env.REDIS_KEY;
  const RedisClient = RedisKey
    ? redis.createClient(RedisPort, RedisHost, {
        auth_pass: RedisKey,
        tls: { servername: RedisHost },
      })
    : redis.createClient(RedisPort, RedisHost);
  const oic = new LoginStrategy({
    issuerHost:
      process.env.OIDC_ISSUER || `${OIDCHost}/.well-known/openid-configuration`,
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uri:
      process.env.OIDC_CLIENT_CALLBACK ||
      `http://localhost:${port}${callbackPath}`,
    scope: 'openid profile',
  });
  passport.use(oic);
  passport.serializeUser(LoginStrategy.serializeUser);
  passport.deserializeUser(LoginStrategy.deserializeUser);
  // Passport requires session to persist the authentication
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'reittiopas_secret',
      store: new RedisStore({
        host: RedisHost,
        port: RedisPort,
        client: RedisClient,
        ttl: 1000 * 60 * 60 * 24 * 365 * 10,
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        sameSite: 'none',
      },
    }),
  );
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', function(req, res, next) {
    if (req.isAuthenticated) {
      res.clearCookie('token');
    }
    next();
  });

  // Initiates an authentication request
  // users will be redirected to hsl.id and once authenticated
  // they will be returned to the callback handler below
  app.get(
    '/login',
    passport.authenticate('passport-openid-connect', {
      successReturnToOrRedirect: '/',
      scope: 'profile',
    }),
  );
  // Callback handler that will redirect back to application after successfull authentication
  app.get(
    callbackPath,
    passport.authenticate('passport-openid-connect', {
      callback: true,
      successReturnToOrRedirect: `${devhost}/`,
      failureRedirect: '/',
    }),
  );
  app.get('/sso-callback', function(req, res, next) {
    if (
      req.isAuthenticated() ||
      req.session.ssoToken === req.query['sso-token']
    ) {
      next();
    } else {
      req.session.ssoToken = req.query['sso-token'];
      res.send();
    }
  });
  app.get('/logout', function(req, res) {
    req.logout();
    req.session.destroy(function() {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
  app.use('/api', function(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.sendStatus(401);
    }
  });
  /* GET the profile of the current authenticated user */
  app.get('/api/user', function(req, res) {
    request.get(
      `${OIDCHost}/openid/userinfo`,
      {
        auth: {
          bearer: req.user.token.access_token,
        },
      },
      function(err, response, body) {
        if (!err) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(401).send('Unauthorized');
        }
      },
    );
  });

  app.use('/api/user/favourites', function(req, res) {
    request(
      {
        auth: {
          bearer: req.user.token.access_token,
        },
        method: req.method,
        url: `${FavouriteHost}/${req.user.data.sub}`,
        body: JSON.stringify(req.body),
      },
      function(err, response, body) {
        if (!err) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(404).send(body);
        }
      },
    );
  });
}
