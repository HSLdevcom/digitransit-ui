/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule buildRQL
 * 
 * @typechecks
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var GraphQL = require('./GraphQL');
var Map = require('fbjs/lib/Map');

var filterObject = require('fbjs/lib/filterObject');
var invariant = require('fbjs/lib/invariant');
var mapObject = require('fbjs/lib/mapObject');

// Cache results of executing fragment query builders.
var fragmentCache = new Map();

// Cache results of executing component-specific route query builders.
var queryCache = new Map();

function isDeprecatedCallWithArgCountGreaterThan(nodeBuilder, count) {
  var argLength = nodeBuilder.length;
  if (process.env.NODE_ENV !== 'production') {
    var mockImpl = nodeBuilder;
    while (mockImpl && mockImpl._getMockImplementation) {
      mockImpl = mockImpl._getMockImplementation();
    }
    if (mockImpl) {
      argLength = mockImpl.length;
    }
  }
  return argLength > count;
}

/**
 * @internal
 *
 * Builds a static node representation using a supplied query or fragment
 * builder. This is used for routes, containers, and mutations.
 *
 * If the supplied fragment builder produces an invalid node (e.g. the wrong
 * node type), these will return `undefined`. This is not to be confused with
 * a return value of `null`, which may result from the lack of a node.
 */
var buildRQL = {
  Fragment: function Fragment(fragmentBuilder, values) {
    var node = fragmentCache.get(fragmentBuilder);
    if (!node) {
      var variables = toVariables(values);
      !!isDeprecatedCallWithArgCountGreaterThan(fragmentBuilder, 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Deprecated usage detected. If you are trying to define a ' + 'fragment, use `variables => Relay.QL`.') : invariant(false) : undefined;
      node = fragmentBuilder(variables);
      fragmentCache.set(fragmentBuilder, node);
    }
    return GraphQL.isFragment(node) ? node : undefined;
  },

  Query: (function (_Query) {
    function Query(_x, _x2, _x3, _x4) {
      return _Query.apply(this, arguments);
    }

    Query.toString = function () {
      return _Query.toString();
    };

    return Query;
  })(function (queryBuilder, Component, queryName, values) {
    var componentCache = queryCache.get(queryBuilder);
    var node;
    if (!componentCache) {
      componentCache = new Map();
      queryCache.set(queryBuilder, componentCache);
    } else {
      node = componentCache.get(Component);
    }
    if (!node) {
      var variables = toVariables(values);
      !!isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 2) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Deprecated usage detected. If you are trying to define a ' + 'query, use `(Component, variables) => Relay.QL`.') : invariant(false) : undefined;
      if (isDeprecatedCallWithArgCountGreaterThan(queryBuilder, 0)) {
        node = queryBuilder(Component, variables);
      } else {
        node = queryBuilder(Component, variables);
        if (GraphQL.isQuery(node) && node.fragments.length === 0) {
          var rootCall = node.calls[0];
          if (!node.fields.every(function (field) {
            return field.fields.length === 0;
          })) {
            !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay.QL: Expected query `%s` to be empty. For example, use ' + '`node(id: $id)`, not `node(id: $id) { ... }`.', rootCall.name) : invariant(false) : undefined;
          }
          var fragmentValues = filterObject(values, function (_, name) {
            return Component.hasVariable(name);
          });
          node = new GraphQL.Query(rootCall.name, rootCall.value, node.fields, [Component.getFragment(queryName, fragmentValues)], node.metadata, node.name);
        }
      }
      componentCache.set(Component, node);
    }
    if (node) {
      return GraphQL.isQuery(node) ? node : undefined;
    }
    return null;
  })
};

function toVariables(variables) {
  return mapObject(variables, function (_, name) {
    return new GraphQL.CallVariable(name);
  });
}

module.exports = buildRQL;