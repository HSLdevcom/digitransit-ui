React          = require 'react'

class NoFavouritesPanel extends React.Component

  render: ->
    <div className="small-12 medium-6 large-4 columns">
      <div className="card padding-small cursor-pointer">
        <p>
          Et ole vielä tallentanut yhtään suosikkia, joten emme voi näyttää niitä.
        </p>
      </div>
    </div>

module.exports = NoFavouritesPanel
