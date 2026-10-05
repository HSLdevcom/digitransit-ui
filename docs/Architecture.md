Digitransit-ui is a React based web application. The following bullet points describe the architecture on a overview level and provide guidelines on how the code should be.

# Logic (i.e. HTML + JS in traditional web)
 - Front-end is written using modern JavaScript (ES2015)
 - Use Babel to transpile it into ES5
 - We could provide a different bundle for modern browsers using widely-supported ES6 syntax
 - Use polyfills for older browsers by polyfill-service
 - React + JSX
 - Airbnb styleguide for ES6 and React

## Additions to Airbnb style guide
 - Use object property spread instead of `Object.assign` when creating new objects: *not* `Object.assign({}, {state}, {a: 1, b: 2})`, but *instead* `{...state, a: 1, b: 2}`

## Components
  - Three types of components
  - Views
    - Simple views that transform props to JSX
    - Views must contain only DOM elements and other Views
      - i.e. no references to containers
    - Views should preferably be created using stateless functional components
    - Views mustn't hold any state
      - State should use React hooks and context; existing Fluxible stores are legacy
  - RelayConnector
    - Data from server should be fetched by adding a relay fragment and wrapping it with `Relay.createContainer`
    - The file should have the pure view as default export and the <View>RelayConnector as named export
      - Alternatively both components can be placed in separate files
    - The view should use RelayContainers in its render method if `props.relay` is defined. If `props.relay` is not defined, then the pure view should be used instead.
  - Containers
    - Two types of containers
    - "Traditional" containers
      - Containers are components that do complex transformations of props data in order to show one or more views or containers
      - Containers should only contain only other containers and views
        - i.e. no DOM components
      - Continers must include `Container` in their name
    - StoreConnectors
      - Legacy Fluxible store data is loaded using fluxible connectToStores
      - Higher order component that wraps another component to provide store state to other component props
      - Must include StoreConnector in their name
    - Containers should include unit tests either testing their functions separately or by testing their rendering using React Testing Library

React components can access data in two different ways:
- OpenTripPlanner GraphQL queries with Relay
- Other querys with Flux model

Basically, division between alternatives is:
- GraphQL is used to fetch data from server
- Non-GraphQL requests may use a focused data helper or React context
- Existing Flux stores remain for state not yet migrated

New application state should use React hooks and context rather than Fluxible.
GeoJSON fetching uses `useGeoJsonObjects` in
`app/hooks/useGeoJsonObjects.js`. It loads configured layers from a hook and
shares fetch promises across map and dialog consumers. Layer visibility
settings remain in the legacy `MapLayerStore`.
Old-searches history (the former Fluxible `OldSearchesStore`) is managed by
named functions in `app/data/SearchHistory.js`, which read/write
`localStorage` directly. Unlike favourites, nothing reactively subscribes to
this data, so it has no Context/hook layer.

![Architecture](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/architecture.png)

Links:
* https://facebook.github.io/flux/docs/overview.html
* http://facebook.github.io/react/
* https://github.com/relay-tools/found-relay/
* https://facebook.github.io/relay/
* https://facebook.github.io/graphql/

# CSS (or styles in general)
  - Modular CSS
    - how to implement is still a good question
    - Prefer flexbox based layouts if it simplifies the layouting process
    - We should provide information about layout (mobile/tablet/desktop) in the context by using matchMedia or browser sniffing in order for the containers to be able to render different contents depending on the device

 - How to get there
    - Still a uncertain process
