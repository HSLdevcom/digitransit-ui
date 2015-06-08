React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'


class NoLocationPanel extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <div className="no-location-panel">
      <p className="text-center">
        Sijaintisi ei ole tiedossa, joten emme voi näyttää lähimpiä pysäkkejä.
      </p>

      <p className="locate-yourself" onTouchTap={this.locateUser}>
        <Icon img={'icon-icon_mapMarker-location'}/> <span className="link">Paikanna itsesi</span>
      </p>

      <p className="text-center separator">
        Tai
      </p>

      <p className="text-center">
        Kirjoita sijaintisi tai lähtöpaikkasi hakukenttään.
      </p>

      <p className="text-center separator">
        Tai
      </p>

      <p className="text-center">
        Valitse sijaintisi edellisistä hauistasi:
      </p>

    </div>

  locateUser: ->
    @context.executeAction LocateActions.findLocation

module.exports = NoLocationPanel