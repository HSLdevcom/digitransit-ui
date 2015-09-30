React          = require 'react'

class NoFavouritesPanel extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <div className="no-favourites-panel text-center">
      <p>
        Et ole vielä tallentanut yhtään suosikkia, joten emme voi näyttää niitä.
      </p>
    </div>

module.exports = NoFavouritesPanel
