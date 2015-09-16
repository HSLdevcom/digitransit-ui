React            = require 'react'
MasonryComponent = require '../util/masonry-component'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class StopCardList extends React.Component
  render: =>
    <div className="cards">
      <div className="row">
        <MasonryComponent ref="cards-masonry">
          {@props.children}
        </MasonryComponent>
      </div>
      <div className="row">
        <div className="small-10 small-offset-1 medium-6 medium-offset-3 columns">
          <button className="show-more" onClick=@props.addStops>
            <FormattedMessage id="show-more" defaultMessage="Show more" />
          </button>
        </div>
      </div>
    </div>

module.exports = StopCardList
