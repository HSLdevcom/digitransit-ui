React          = require 'react'
FormattedMessage = require('react-intl').FormattedMessage

class NoFavouritesPanel extends React.Component

  render: ->
    <div className="row">
      <div className="small-12 columns">
        <p className="gray text-center">
          <FormattedMessage id="no-favourites"
                          defaultMessage="You have not yet saved any favorites, so we can not show them."/>
        </p>
      </div>
    </div>


module.exports = NoFavouritesPanel
