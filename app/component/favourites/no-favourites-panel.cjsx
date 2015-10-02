React          = require 'react'

class NoFavouritesPanel extends React.Component

  render: ->
    <div className="no-favourites-panel text-center">
      <p>
        Et ole vielä tallentanut yhtään suosikkia, joten emme voi näyttää niitä.
      </p>
    </div>

module.exports = NoFavouritesPanel
