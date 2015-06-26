React         = require 'react'
TimeSelectors = require './time-selectors'

class IndexSubNavigation extends React.Component
  propTypes =
    visible: React.PropTypes.bool.isRequired

  render: ->
    if not @props.visible
      return null

    <div className="sub-navigation">
      <div className="row">
        <div className="small-12 columns">
          <div className="arrow-up"></div>
          <TimeSelectors/>
        </div>
      </div>
    </div>

module.exports = IndexSubNavigation
