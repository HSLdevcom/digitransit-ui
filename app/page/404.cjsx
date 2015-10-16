React = require 'react'
{FormattedMessage} = require('react-intl')

Page = React.createClass

  render: ->
    <div>
      <p>
        <FormattedMessage id="page-not-found"
                          defaultMessage="Bummer! page is not found" />
      </p>
    </div>

module.exports = Page
