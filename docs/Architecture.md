Digitransit-ui is a React based web application. The following bullet points describe the architecture on a overview level and provide guidelines on how the code should be.

# Logic (i.e. HTML + JS in traditional web)
 - Front-end is written using modern JavaScript (ES2015)
 - Use Babel to transpile it into ES5
 - We could provide a different bundle for modern browsers using widely-supported ES6 syntax
 - Polyfills are injected at build time by `@babel/preset-env` (`useBuiltIns: 'entry'`, core-js 3) via a single `import 'core-js/stable'` in `app/client/client.jsx` based on the `browserslist` targets
 - React + JSX
 - Airbnb styleguide for ES6 and React

## Additions to Airbnb style guide
 - Use object property spread instead of `Object.assign` when creating new objects: *not* `Object.assign({}, {state}, {a: 1, b: 2})`, but *instead* `{...state, a: 1, b: 2}`

## Components
  - Components are function components that fetch data and manage state with hooks
  - Some components still follow the older View / RelayConnector / Container split (files named `*Container`, `<View>RelayConnector` exports), but we are moving away from this pattern
  - Components should include unit tests, preferably using React Testing Library

React components can access data in two different ways:
- OpenTripPlanner GraphQL queries with Relay
- Other state with React hooks and context

Basically, division between alternatives is:
- GraphQL is used to fetch data from server
- Non-GraphQL requests may use a focused data helper or React context

Realtime vehicle information is owned by `RealTimeInformationProvider` in
`app/hooks/RealTimeInformationContext.jsx`. `useRealTimeInformation` subscribes
to vehicle snapshots, published at most once per second. `useRealTimeActions`
provides stable connection and subscription controls without subscribing to
vehicle updates. The provider closes MQTT clients and cancels pending updates
on unmount; MQTT helpers deliver messages through callbacks rather than
actions.
GeoJSON fetching uses `useGeoJsonObjects` in
`app/hooks/useGeoJsonObjects.js`. It loads configured layers from a hook and
shares fetch promises across map and dialog consumers. Layer visibility
settings are in `MapLayerContext` (`app/hooks/MapLayerContext.jsx`).
Old-searches history is managed by
named functions in `app/data/SearchHistory.js`, which read/write
`localStorage` directly. Unlike favourites, nothing reactively subscribes to
this data, so it has no Context/hook layer.

![Architecture](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/architecture.png)

Links:
* https://react.dev/
* https://github.com/relay-tools/found-relay/
* https://relay.dev/
* https://graphql.org/

# CSS (or styles in general)
  - Modular CSS
    - how to implement is still a good question
    - Prefer flexbox based layouts if it simplifies the layouting process
    - We should provide information about layout (mobile/tablet/desktop) in the context by using matchMedia or browser sniffing in order for the containers to be able to render different contents depending on the device

 - How to get there
    - Still a uncertain process
