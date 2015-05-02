React            = require 'react/addons' 
MasonryComponent = require './MasonryComponent'

class StopCardList extends React.Component
  reloadMasonry: =>
    @refs['stop-cards-masonry'].performLayout()

  renderChildrenWithReloadMasonry: =>
    React.Children.map @props.children, (child) =>
      React.addons.cloneWithProps child,
        reloadMasonry: @reloadMasonry

  render: =>
    <div className="stop-cards">
      <div className="row">
        <MasonryComponent ref="stop-cards-masonry">
          {@renderChildrenWithReloadMasonry()}
        </MasonryComponent>
      </div>
      <div className="row">
        <div className="small-10 small-offset-1 medium-6 medium-offset-3 columns">
          <button className="show-more" onClick=@props.addStops>
            Näytä Lisää
          </button>
        </div>
      </div>
    </div>
    
module.exports = StopCardList