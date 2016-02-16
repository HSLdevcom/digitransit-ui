React                     = require 'react'
Icon                      = require '../icon/icon'
cx                        = require 'classnames'
Link                      = require 'react-router/lib/Link'
NotImplementedAction      = require('../../action/not-implemented-action')
NotImplemented            = require '../util/not-implemented'
FavouriteIconTable        = require './favourite-icon-table'
FavouriteLocationActions  = require '../../action/favourite-location-action'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class AddFavouriteContainer extends React.Component

  @contextTypes:
    intl: intl.intlShape.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  constructor: ->
    super
    @state =
      selectedIconIndex: undefined
      lat: undefined
      lon: undefined
      locationName: undefined

  selectIcon: (index, value) =>
    @setState
      selectedIconIndex: index

  specifyName: (event) =>
    input = event.target.value
    @setState
      locationName: input

  serializeLocation: =>
    return {
      selectedIconId: @getFavouriteIconIds()[@state.selectedIconIndex]
      lat: @state.lat
      lon: @state.lon
      locationName: @state.locationName
    }

  setCoordinates: (event) =>
    #TODO: switch to real values after new search component is done
    input = event.target.value
    @setState
      lat: 60.192059
      lon: 24.945831

  save: =>
    if @canSave()
      @context.executeAction FavouriteLocationActions.addFavouriteLocation, @serializeLocation()
      @context.history.pushState null, "/"

  canSave: =>
    return @state.selectedIconIndex != undefined and
      @state.selectedIconIndex != '' and
      @state.lat != undefined and
      @state.lat != '' and
      @state.lon != undefined and
      @state.lon != '' and
      @state.locationName != undefined and
      @state.locationName != ''

  getFavouriteIconIds: ->
    [
      'icon-icon_place'
      'icon-icon_home'
      'icon-icon_work'
      'icon-icon_sport'
      'icon-icon_school'
      'icon-icon_shopping'
    ]

  notImplemented: =>
    context.executeAction NotImplementedAction.click, {name: <FormattedMessage id='your-favourites' defaultMessage='Favourites'/>}
    return false

  render: ->
    <div className={cx @props.className, "add-favourite-container"}>
      <NotImplemented/>
      <Link to="/" className="right cursor-pointer">
        <Icon id="add-favourite-close-icon" img={'icon-icon_close'}/>
      </Link>
      <row>
        <div className="add-favourite-container__content small-12 medium-8 large-6 small-centered columns">
          <header className={"add-favourite-container__header row"}>
            <div className="cursor-pointer add-favourite-star small-1 columns">
              <Icon className={cx "add-favourite-star__icon", "selected"} img="icon-icon_star"/>
            </div>
            <div className="add-favourite-container__header-text small-11 columns">
              <h3><FormattedMessage id="add-location-to-favourites" defaultMessage="Add a location to your favourites tab"/></h3>
            </div>
          </header>
          <div className="add-favourite-container__search">
            <h4><FormattedMessage id="specify-location" defaultMessage="Specify the location"/></h4>
            <div className="add-favourite-container__input-placeholder">
              <input
                placeholder={@context.intl.formatMessage(
                  id: 'address-or-stop'
                  defaultMessage: 'Address or stop')}
                onChange={@setCoordinates}/>
            </div>
          </div>
          <div className="add-favourite-container__give-name">
            <h4><FormattedMessage id="give-name-to-location" defaultMessage="Name the location"/></h4>
            <div className="add-favourite-container__input-placeholder">
              <input
                placeholder={@context.intl.formatMessage(
                  id: 'location-examples'
                  defaultMessage: 'e.g. Home, Work, Scool,...')}
                onChange={@specifyName}/>
            </div>
          </div>
          <div className="add-favourite-container__pick-icon">
            <h4><FormattedMessage id="pick-icon" defaultMessage="Select an icon"/></h4>
            <FavouriteIconTable
              selectedIconIndex={if @state.selectedIconIndex != 'undefined' or null then @state.selectedIconIndex else undefined}
              favouriteIconIds={@getFavouriteIconIds()}
              handleClick={@selectIcon}/>
          </div>
          <div className="add-favourite-container__save">
            <div
              className={if @canSave() then "add-favourite-container__save-button" else "add-favourite-container__save-button--disabled"}
              onClick={@save}>
              <FormattedMessage id="save"
                                defaultMessage="Save"/>
            </div>
          </div>
        </div>
      </row>
    </div>


module.exports = AddFavouriteContainer
