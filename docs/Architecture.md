Digitransit-ui is a React based web application. The following bullet point describe the architecture on a overview level and provide guidelines on how the code should be.

# Logic (i.e. HTML + JS in traditional web)
 - Front-end is written using modern javascript (ES2015)
 - Use Babel to transpile into ES5
  - We could provide a different bundle for modern browsers using widely-supported es6 syntax
 - Use polyfills for older browsers by polyfill-service
 - React + JSX
 - Airbnb styleguide for ES6 and React

## Additions to Airbnb style guide
 - Use object property spread instead of Object.assign when creating new objects: *not* Object.assign({}, {state}, {a: 1, b: 2}), but *instead* {...state, a:1, b: 2}

## Components
  - Three types of components
  - Views
    - Simple views that transform props to JSX
    - Views must contain only dom elements and other Views
      - i.e. no no references to containers
    - Views should preferably be created using stateless functional components
    - Views mustn't hold any state
      - If state is needed you should either store it using fluxible or in a container
    - Must be included in the style guide
    - Visual regression testing using gemini
      - all use cases should be provided by the style guide
  - RelayConnector
    - Data from server should be fetched by adding a relay fragment and wrapping it with Relay.createContainer
    - The file should have the pure view as default export and the <View>RelayConnector as named export
      - Alternatively both components can be placed in separate files
    - The view should use RelayContainers in its render method if props.relay is defined. If props.relay is not defined, then the pure view should be used instead.
  - Containers
    - Two types of containers
    - "Traditional" containers
      - Containers are components that do complex transformations of props data in order to show one or more views or containers
      - Containers should only contain only other containers and views
        - i.e. no dom components
      - Continers must include Container in their name
    - StoreConnectors
      - Data from stores should be loaded using fluxible connectToStores
      - Higher order component that wraps another component to provide store state to other component props
      - Must include StoreConnector in their name
    - Containers should include unit tests either testing their functions separately or by testing it's shallow rendering using Enzyme

## Flow testing
  - Most commonly used flows, i.e. making a route search and navigating routes/stops/trips should be tested using Nightwatch
  - Should be tested in browserstack using most commonly used browsers

## How to get there
  - Incremental process
  - When working with a file
    - add to style guide
    - write gemini and/or unit tests
    - create gemini images

React components can access data in two different ways:
- Open Trip Planner GraphQL queries with Relay
- Other querys with Flux model

Basically, division between alternatives is:
- GraphQL is used to fetch data from server
- If server endpoint does not support GraphQL, flux can be used to retrieve that data
- Flux stores are mainly used to store application state

![Architecture](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/architecture.png)

Links:
* https://facebook.github.io/flux/docs/overview.html
* http://facebook.github.io/react/
* https://github.com/rackt/react-router
* https://facebook.github.io/relay/
* https://facebook.github.io/graphql/

# CSS (or styles in general)
  - Modular CSS
    - how to implement is still a good question
    - Prefer fluxbox based layouts if it simplifies the layouting process
    - We should provide information about layout (mobile/tablet/desktop) in the context by using matchMedia or browser sniffing in order for the containers to be able to render different contents depending on the device

 - How to get there
    - Still a uncertain process
