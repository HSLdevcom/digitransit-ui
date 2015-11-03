React            = require 'react'
MasonryComponent = require '../util/masonry-component'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class StopCardList extends React.Component
  render: =>
    <div className="cards">
      <div className="row">
        <MasonryComponent ref="cards-masonry">
          {@props.children.map (child) ->
            <div key={child.key} className="small-12 medium-6 large-4 columns">
              {child}
            </div>
          }
        </MasonryComponent>
      </div>
      {if not @props.hideShowMoreButton
        <div className="row">
          <div className="small-10 small-offset-1 medium-6 medium-offset-3 columns">
            <button className="show-more cursor-pointer" onClick=@props.addStops>
              <FormattedMessage id="show-more" defaultMessage="Show more" />
            </button>
          </div>
        </div>}
    </div>



module.exports = StopCardList
