# Libraries
React        = require 'react'
Router       = require 'react-router'

routes       = require './routes'

# Run application
Router.run(routes, Router.HistoryLocation, (Handler) -> 
  React.render(<Handler/>, document.getElementById('app'))
)
