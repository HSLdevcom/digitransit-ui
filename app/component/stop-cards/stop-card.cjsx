React     = require 'react'
div       = React.createFactory 'div'
Departure = require './departure'
  
class StopCard extends React.Component
  StopCard.contextTypes = {
    router: React.PropTypes.func
  };

  render: ->
    router = this.context.router
    <div className="small-12 medium-6 large-4 columns">
      <div className="stop-card cursor-pointer" onClick={() => router.transitionTo('/pysakit/todo-id')}>
        <span className="favourite"><i className="icon icon-favourite"></i></span>
        <h3>{@props.name} ›</h3>
        <p className="location">Asemapäällikönk. 8 // 2166 // 88m</p>
        <Departure 
          times={["14:44", "15:04"]}
          mode="bus"
          routeShortName="504"
          destination="Kivenlahti" />
      </div>
    </div>



module.exports = StopCard