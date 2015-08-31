Digitransit-ui is a React based web application. React components can access data in two different ways:
* Open Trip Planner GraphQL queries with Relay
* Other queris with Flux model

Basically, we priorize GraphQL queries and use flux only when we have to.

![Architecture](https://raw.githubusercontent.com/wiki/HSLdevcom/digitransit/docs/images/architecture.png)

Links:
* https://facebook.github.io/flux/docs/overview.html
* http://facebook.github.io/react/
* https://github.com/rackt/react-router
* https://facebook.github.io/relay/
* https://facebook.github.io/graphql/

## Flux Stores vs Relay

Relay's GraphQL approach is cleaner than full blown Flux architecture. Relay also provides interesting approaches to e.g. Background updates for data.

Basically, if you can use Relay to do something, you should.

Flux on the other hand provides us a way to share application state with multiple React components.
