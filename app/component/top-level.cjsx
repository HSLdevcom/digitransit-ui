React  = require 'react'
Helmet = require 'react-helmet'
meta   = require('../meta')

class TopLevel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    metadata = meta @context.getStore('PreferencesStore').getLanguage()
    <div className="fullscreen">
      <Helmet {...metadata}/>
      {@props.children}
    </div>


module.exports = TopLevel
