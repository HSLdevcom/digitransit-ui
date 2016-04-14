React  = require 'react'

class OriginPopup extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentWillMount: =>
#    @context.getStore('PositionStore').addChangeListener @onPositionChange
#    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
#    @context.getStore('PositionStore').removeChangeListener @onPositionChange
#    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

    onEndpointChange: (endPointChange) =>
      console.log "endpoint changed, should popup"

      console.log(@props)
     # @props.popupContainer.openPopup(this);

    onPositionChange: (status) =>
      console.log("endpoint changed, should popup")


  render: ->
    console.log("props:", @props);
    <div>Where ever you go, there you are</div>

module.exports = OriginPopup
