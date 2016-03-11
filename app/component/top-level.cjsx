React  = require 'react'
Helmet = require 'react-helmet'
meta   = require '../meta'

class TopLevel extends React.Component
  @childContextTypes:
    location: React.PropTypes.object

  getChildContext: () ->
    location: @props.location

  render: ->
    <div className="fullscreen">
      <Helmet {...meta}/>
      {@props.children}
    </div>


module.exports = TopLevel
