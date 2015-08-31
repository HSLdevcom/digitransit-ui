Digitransit-ui is a React based web application. React components can access data in two different ways:
* Open Trip Planner GraphQL queries with Relay
* Other querys with Flux model

Basically, division between alternatives is:
- GraphQL is used to fetch data from server
- If server endpoint does not support GraphQL, flux can be used to retrieve that data
- Flux stores are mainly used to store application state

![Architecture](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/docs/docs/images/architecture.png)

Links:
* https://facebook.github.io/flux/docs/overview.html
* http://facebook.github.io/react/
* https://github.com/rackt/react-router
* https://facebook.github.io/relay/
* https://facebook.github.io/graphql/