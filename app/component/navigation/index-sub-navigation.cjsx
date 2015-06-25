React         = require 'react'
TimeStore     = require '../../store/time-store'
TimeActions   = require '../../action/time-action'
moment        = require 'moment'
TimeSelectors = require './time-selectors'

class IndexSubNavigation extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func

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
