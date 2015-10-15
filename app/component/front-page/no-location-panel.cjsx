React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'
{FormattedMessage} = require('react-intl')


class NoLocationPanel extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <div className="gray text-center">
      <p>
        <FormattedMessage
          id="no-position"
          defaultMessage="Nearest stops cannot be shown because your position is not known." />
      </p>

      <p className="locate-yourself large-text cursor-pointer" onClick={@locateUser}>
        <Icon img={'icon-icon_mapMarker-location'}/>
        <a className="dashed-underline">
          <FormattedMessage
            id="geolocate-yourself"
            defaultMessage="Locate yourself" />
        </a>
      </p>

      <p className="separator">
        Tai
      </p>

      <p>
        <FormattedMessage
          id="give-position"
          defaultMessage="Write your position or origin into the search field." />
      </p>

      <p className="separator">
        <FormattedMessage id="or" defaultMessage="Or" />
        Tai
      </p>

      <p>
        <FormattedMessage
          id="select-position"
          defaultMessage="Select your position from previous searches" />:
      </p>

    </div>

  locateUser: ->
    @context.executeAction LocateActions.findLocation

module.exports = NoLocationPanel
