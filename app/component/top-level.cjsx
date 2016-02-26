React  = require 'react'
Helmet = require 'react-helmet'
meta   = require('../meta')
configureMoment = require '../util/configure-moment'

class TopLevel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    preferencesStore = @context.getStore('PreferencesStore')
    language = preferencesStore.getLanguage()
    configureMoment(language)

    metadata = meta language
    <div className="fullscreen">
      <Helmet {...metadata}/>
      {@props.children}
    </div>


module.exports = TopLevel
