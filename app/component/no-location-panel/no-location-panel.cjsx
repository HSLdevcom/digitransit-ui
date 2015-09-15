React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'


class NoLocationPanel extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <div className="no-location-panel text-center">
      <p>
        Sijaintisi ei ole tiedossa, joten emme voi näyttää lähimpiä pysäkkejä.
      </p>

      <p className="locate-yourself large-text" onClick={this.locateUser}>
        <Icon img={'icon-icon_mapMarker-location'}/> <a className="dashed-underline">Paikanna itsesi</a>
      </p>

      <p className="separator">
        Tai
      </p>

      <p>
        Kirjoita sijaintisi tai lähtöpaikkasi hakukenttään.
      </p>

      <p className="text-center separator">
        Tai
      </p>

      <p>
        Valitse sijaintisi edellisistä hauistasi:
      </p>

    </div>

  locateUser: ->
    @context.executeAction LocateActions.findLocation

module.exports = NoLocationPanel
