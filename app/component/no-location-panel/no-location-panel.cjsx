React          = require 'react'
LocateActions  = require '../../action/locate-actions.coffee'

class NoLocationPanel extends React.Component
  render: ->
    <div className="no-location-panel">
      <p className="text-center">
        Sijaintisi ei ole tiedossa, joten emme voi näyttää lähimpiä pysäkkejä.
      </p>

      <p className="locate-yourself" onClick={this.locateUser}>
        <i className="icon icon-location"></i> <span className="link">Paikanna itsesi</span>
      </p>

      <p className="text-center">
        Tai
      </p>

      <p className="text-center">
        Kirjoita sijaintisi tai lähtöpaikkasi hakukenttään.
      </p>

      <p className="text-center">
        Tai
      </p>

      <p className="text-center">
        Valitse sijaintisi edellisistä hauistasi:
      </p>

    </div>

  locateUser: ->
    LocateActions.findLocation()

module.exports = NoLocationPanel