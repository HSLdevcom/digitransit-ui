React = require 'react'
classnames = require 'classnames'

class RouteListHeader extends React.Component
  @propTypes:
    headers: React.PropTypes.array
    columnClasses: React.PropTypes.array

  getHeaders: ->
    classes = @props.columnClasses
    @props.headers.map (headerText, i) ->
      if classes[i]
        <div key={headerText} className={classnames 'columns', classes[i]}>
          {headerText}
        </div>

  render: ->
    <div className="route-list-header route-stop row padding-vertical-small">
      {@getHeaders()}
    </div>

module.exports = RouteListHeader
