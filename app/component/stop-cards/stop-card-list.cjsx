React            = require 'react'
MasonryComponent = require '../util/masonry-component'

class StopCardList extends React.Component
  render: =>
    <div className="stop-cards">
      <div className="row">
        <MasonryComponent ref="stop-cards-masonry">
          {@props.children}
        </MasonryComponent>
      </div>
      <div className="row">
        <div className="small-10 small-offset-1 medium-6 medium-offset-3 columns">
          <button className="show-more" onTouchTap=@props.addStops>
            Näytä Lisää
          </button>
        </div>
      </div>
    </div>

module.exports = StopCardList
