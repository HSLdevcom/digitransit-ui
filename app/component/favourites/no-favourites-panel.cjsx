React          = require 'react'
FormattedMessage = require('react-intl').FormattedMessage

class NoFavouritesPanel extends React.Component

  render: ->
    <div className="gray text-center">
      <p>
        <FormattedMessage id="no-favourites"
                          defaultMessage="Et ole vielä tallentanut yhtään suosikkia, joten emme voi näyttää niitä." />
      </p>
    </div>



module.exports = NoFavouritesPanel
