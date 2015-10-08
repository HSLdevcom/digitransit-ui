React          = require 'react'
FormattedMessage = require('react-intl').FormattedMessage

class NoFavouritesPanel extends React.Component

  render: ->
    <div className="gray text-center">
      <p>
        <FormattedMessage id="no-favourites"
                          defaultMessage="You have not yet saved any favorites, so we can not show them."/>
      </p>
    </div>



module.exports = NoFavouritesPanel
