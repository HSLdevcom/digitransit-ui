/* eslint-disable func-names, no-console */
const passport = require('passport');
const session = require('express-session');
const redis = require('redis');
const request = require('request');
const moment = require('moment');
const RedisStore = require('connect-redis')(session);
const LoginStrategy = require('./Strategy').Strategy;

const clearAllUserSessions = false; // set true if logout should erase all user's sessions

const debugLogging = process.env.DEBUGLOGGING;

export default function setUpOIDC(app, port, indexPath) {
  const hostname = process.env.HOSTNAME || `https://localhost:${port}`;
  /* ********* Setup OpenID Connect ********* */
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
      process.env.OIDC_CLIENT_CALLBACK || `${hostname}${callbackPath}`,
    post_logout_redirect_uris: [`${hostname}/logout/callback`],
    scope: 'openid profile',
    sessionCallback(userId, sessionId) {
      // keep track of per-user sessions
      if (debugLogging) {
        console.log(`adding session for used ${userId} id ${sessionId}`);
      }
      if (clearAllUserSessions) {
        RedisClient.sadd(`sessions-${userId}`, sessionId);
      }
    },
  });

  const redirectToLogin = function (req, res, next) {
    const { ssoValidTo, ssoToken } = req.session;
    const paths = [
      '/fi/',
      '/en/',
      '/sv/',
      '/reitti/',
      '/pysakit/',
      '/linjat/',
      '/terminaalit/',
      '/pyoraasemat/',
      '/lahellasi/',
    ];
    // Only allow sso login when user navigates to certain paths
    // Query parameter is string type
    if (
      req.query.sso !== 'false' &&
      (req.path === `/${indexPath}` ||
        paths.some(path => req.path.includes(path))) &&
      !req.isAuthenticated() &&
      ssoToken &&
      ssoValidTo &&
      ssoValidTo > moment().unix()
    ) {
      if (debugLogging) {
        console.log(
          'redirecting to login with sso token ',
          JSON.stringify(ssoToken),
        );
      }
      res.redirect('/login');
    } else {
      next();
    }
  };

  const setReturnTo = function (req, res, next) {
    const paths = [
      '/fi/',
      '/en/',
      '/sv/',
      '/reitti/',
      '/pysakit/',
      '/linjat/',
      '/terminaalit/',
      '/pyoraasemat/',
      '/lahellasi/',
    ];
    if (
      (req.path === `/${indexPath}` ||
        paths.some(path => req.path.includes(path))) &&
      !req.isAuthenticated() &&
      !req.path.includes('time-a')
    ) {
      const params = Object.keys(req.query)
        .map(k => `${k}=${req.query[k]}`)
        .join('&');
      req.session.returnTo = `${req.path}?${params}`;
    }
    next();
  };

  const refreshTokens = function (req, res, next) {
    if (
      req.isAuthenticated() &&
      req.user.token.refresh_token &&
      moment().unix() >= req.user.token.expires_at
    ) {
      return passport.authenticate('passport-openid-connect', {
        refresh: true,
        successReturnToOrRedirect: `/${indexPath}`,
        failureRedirect: `/${indexPath}`,
      })(req, res, next);
    }
    return next();
  };

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
  passport.use('passport-openid-connect', oic);
  passport.serializeUser(LoginStrategy.serializeUser);
  passport.deserializeUser(LoginStrategy.deserializeUser);
  app.use(setReturnTo);
  app.use(redirectToLogin);
  app.use(refreshTokens);
  // Initiates an authentication request
  // users will be redirected to hsl.id and once authenticated
  // they will be returned to the callback handler below
  app.get('/login', function (req, res) {
    const favAction = req.query.favouriteModalAction;
    const { url } = req.query;
    if (favAction) {
      req.session.returnTo = `${
        req.session.returnTo || `/${indexPath}?`
      }&favouriteModalAction=${favAction}`;
    }
    if (url) {
      req.session.returnTo = `${url}`;
    }
    passport.authenticate('passport-openid-connect', {
      scope: 'profile',
      successReturnToOrRedirect: '/',
    })(req, res);
  });

  // Callback handler that will redirect back to application after successfull authentication
  app.get(
    callbackPath,
    passport.authenticate('passport-openid-connect', {
      callback: true,
      successReturnToOrRedirect: `/${indexPath}`,
      failureRedirect: '/login',
    }),
  );

  app.get('/logout', function (req, res) {
    const cookieLang = req.cookies.lang || 'fi';
    const logoutUrl = `${oic.client.endSessionUrl()}&ui_locales=${cookieLang}&id_token_hint=${
      req.user.token.id_token
    }`;
    req.session.userId = req.user.data.sub;
    if (debugLogging) {
      console.log(`logout for user ${req.user.data.name} to ${logoutUrl}`);
    }
    res.redirect(logoutUrl);
  });

  app.get('/logout/callback', function (req, res) {
    if (debugLogging) {
      console.log(`logout callback for userId ${req.session.userId}`);
    }
    const sessions = `sessions-${req.session.userId}`;
    req.logout();
    RedisClient.smembers(sessions, function (err, sessionIds) {
      req.session.destroy(function () {
        res.clearCookie('connect.sid');
        if (sessionIds && sessionIds.length > 0) {
          if (debugLogging) {
            console.log(`Deleting ${sessionIds.length} sessions`);
          }
          RedisClient.del(...sessionIds);
          RedisClient.del(sessions);
        }
        res.redirect(`/${indexPath}`);
      });
    });
  });

  app.get('/sso/auth', function (req, res, next) {
    if (debugLogging) {
      console.log(`GET sso/auth, token=${req.query['sso-token']}`);
    }
    if (req.isAuthenticated()) {
      if (debugLogging) {
        console.log('GET sso/auth -> already authenticated');
      }
      next();
    } else {
      if (debugLogging) {
        console.log('GET sso/auth -> updating token');
      }
      req.session.ssoToken = req.query['sso-token'];
      req.session.ssoValidTo =
        Number(req.query['sso-validity']) * 60 * 1000 + moment().unix();
      res.send();
    }
  });

  app.use('/api', function (req, res, next) {
    res.set('Cache-Control', 'no-store');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.sendStatus(401);
    }
  });

  /* GET the profile of the current authenticated user */
  app.get('/api/user', function (req, res) {
    request.get(
      `${OIDCHost}/openid/userinfo`,
      {
        auth: {
          bearer: req.user.token.access_token,
        },
      },
      function (err, response, body) {
        if (!err && response.statusCode === 200) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(401).send('Unauthorized');
        }
      },
    );
  });

  // Temporary solution for checking if user is authenticated
  const userAuthenticated = function (req, res, next) {
    request.get(
      `${OIDCHost}/openid/userinfo`,
      {
        auth: {
          bearer: req.user.token.access_token,
        },
      },
      function (err, response) {
        if (!err && response.statusCode === 200) {
          next();
        } else {
          res.status(401).send('Unauthorized');
        }
      },
    );
  };
  app.use('/api/user/favourites', userAuthenticated, function (req, res) {
    request(
      {
        auth: {
          bearer: req.user.token.access_token,
        },
        method: req.method,
        url: `${FavouriteHost}/${req.user.data.sub}`,
        body: JSON.stringify(req.body),
      },
      function (err, response, body) {
        if (!err) {
          res.status(response.statusCode).send(body);
        } else {
          res.status(response.statusCode).send(body);
        }
      },
    );
  });
}
