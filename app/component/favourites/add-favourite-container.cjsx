React                 = require 'react'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
Link                  = require 'react-router/lib/Link'
NotImplementedAction = require('../../action/not-implemented-action')
NotImplemented        = require '../util/not-implemented'
FavouriteIconTable    = require './favourite-icon-table'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class AddFavouriteContainer extends React.Component


  constructor: ->
    super
    @state =
      selectedIconIndex: undefined
      locationCoordinates: undefined
      locationName: undefined

  @contextTypes:
    intl: intl.intlShape.isRequired

  selectIcon: (index, value) =>
    @setState
      selectedIconIndex: index

  specifyName: (event) =>
    input = event.target.value
    @setState
      locationName: input

  setCoordinates: (event) =>
    input = event.target.value
    @setState
      locationCoordinates: input

  save: =>
    #TODO save favourite location to localstorage
    @notImplemented()
    return

  canSave: =>
    return @state.selectedIconIndex != undefined and
      @state.selectedIconIndex != '' and
      @state.locationCoordinates != undefined and
      @state.locationCoordinates != '' and
      @state.locationName != undefined and
      @state.locationName != ''

  getFavouriteIconIds: ->
    [
      'icon-icon_place'
      'icon-icon_place'
      'icon-icon_place'
      'icon-icon_place'
      'icon-icon_place'
      'icon-icon_place'
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
