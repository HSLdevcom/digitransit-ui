React              = require 'react'
Icon               = require '../icon/icon'
cx                 = require 'classnames'
{FormattedMessage} = require 'react-intl'
connectToStores = require 'fluxible-addons-react/connectToStores'
pure          = require('recompose/pure').default

Locate = () =>
  <span> - <span className="search-position">
    <FormattedMessage id='search-position' defaultMessage='Locate' />
  </span></span>

CurrentPositionSuggestionItem = pure ({item, havePosition}) =>
  <span className={cx "search-result", item.type}>
    <span>
      <span className="autosuggestIcon">
        <Icon img="icon-icon_position" className={cx "havePosition"}/>
      </span>
      <FormattedMessage id='use-own-position' defaultMessage='Use Your current location' />
      {if !havePosition then <Locate/>}
    </span>
  </span>

module.exports = connectToStores CurrentPositionSuggestionItem, ['PositionStore'], (context, props) ->
  havePosition: context.getStore('PositionStore').getLocationState().hasLocation
