/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRoute
 * 
 * @typechecks
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var RelayDeprecated = require('./RelayDeprecated');

var RelayQueryConfig = require('./RelayQueryConfig');

var forEachObject = require('fbjs/lib/forEachObject');
var invariant = require('fbjs/lib/invariant');

var createURI = function createURI() {
  return null;
};

/**
 * Describes the root queries, param definitions and other metadata for a given
 * path (URI).
 */

var RelayRoute = (function (_RelayQueryConfig) {
  _inherits(RelayRoute, _RelayQueryConfig);

  function RelayRoute(initialVariables, uri) {
    _classCallCheck(this, RelayRoute);

    _RelayQueryConfig.call(this, initialVariables);
    var constructor = this.constructor;
    var routeName = constructor.routeName;
    var path = constructor.path;

    !(constructor !== RelayRoute) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRoute: Abstract class cannot be instantiated.') : invariant(false) : undefined;
    !routeName ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: Subclasses of RelayRoute must define a `routeName`.', constructor.name || '<<anonymous>>') : invariant(false) : undefined;

    if (!uri && path) {
      uri = createURI(constructor, this.params);
    }

    Object.defineProperty(this, 'uri', {
      enumerable: true,
      value: uri,
      writable: false
    });
  }

  RelayRoute.prototype.prepareVariables = function prepareVariables(prevVariables) {
    var _constructor = this.constructor;
    var paramDefinitions = _constructor.paramDefinitions;
    var prepareParams = _constructor.prepareParams;
    var processQueryParams = _constructor.processQueryParams;
    var routeName = _constructor.routeName;

    if (processQueryParams && !prepareParams) {
      RelayDeprecated.warn({
        was: routeName + '.processQueryParams',
        now: routeName + '.prepareParams'
      });
      prepareParams = processQueryParams;
    }
    var params = prevVariables;
    if (prepareParams) {
      /* $FlowFixMe(>=0.17.0) - params is ?Tv but prepareParams expects Tv */
      params = prepareParams(params);
    }
    forEachObject(paramDefinitions, function (paramDefinition, paramName) {
      if (params) {
        if (params.hasOwnProperty(paramName)) {
          return;
        } else {
          // Backfill param so that a call variable is created for it.
          params[paramName] = undefined;
        }
      }
      !!paramDefinition.required ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRoute: Missing required parameter `%s` in `%s`. Check the ' + 'supplied params or URI.', paramName, routeName) : invariant(false) : undefined;
    });
    return params;
  };

  RelayRoute.injectURICreator = function injectURICreator(creator) {
    createURI = creator;
  };

  return RelayRoute;
})(RelayQueryConfig);

module.exports = RelayRoute;