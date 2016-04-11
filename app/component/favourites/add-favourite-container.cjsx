React                     = require 'react'
Icon                      = require '../icon/icon'
cx                        = require 'classnames'
Link                      = require 'react-router/lib/Link'
FavouriteIconTable        = require './favourite-icon-table'
FavouriteLocationActions  = require '../../action/favourite-location-action'
SearchField               = require '../search/search-field'
SearchActions             = require '../../action/search-actions'
SearchModal               = require '../search/search-modal'
SearchInput               = require '../search/search-input'
Tab                       = require 'material-ui/lib/tabs/tab'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class AddFavouriteContainer extends React.Component

  @contextTypes:
    intl: intl.intlShape.isRequired
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired

  constructor: ->
    super
    @state =
      selectedIconId: undefined
      lat: undefined
      lon: undefined
      locationName: undefined
      address: undefined
      searchModalIsOpen: false

  selectIcon: (id) =>
    @setState
      selectedIconId: id

  specifyName: (event) =>
    input = event.target.value
    @setState
      locationName: input

  setCoordinatesAndAddress: (name, location) =>
    @setState
      lat: location.geometry.coordinates[1]
      lon: location.geometry.coordinates[0]
      address: name

  save: =>
    if @canSave()
      @context.executeAction FavouriteLocationActions.addFavouriteLocation, @state
      @context.router.replace "/"

  canSave: =>
    return @state.selectedIconId != undefined and
      @state.selectedIconId != '' and
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

  focusInput: () =>
    @refs.searchInputfavourite?.refs.autowhatever?.refs.input?.focus()

  closeSearchModal: () =>
    @setState
      searchModalIsOpen: false

  render: ->

    geolocation = @context.getStore('PositionStore').getLocationState()

    destinationPlaceholder = @context.intl.formatMessage(
      id: 'address'
      defaultMessage: 'Address')

    searchTabLabel = @context.intl.formatMessage(
      id: 'favourite-target'
      defaultMessage: 'Favourite place'
    )

    <div>
      <div className={cx @props.className, "add-favourite-container"}>
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
            <div className="add-favourite-container__search search-form">
              <h4><FormattedMessage id="specify-location" defaultMessage="Specify the location"/></h4>
              <SearchField
                endpoint={"address": @state?.address || ""}
                geolocation={geolocation}
                onClick={(e) =>
                  e.preventDefault()
                  @setState
                    searchModalIsOpen: true
                    () =>
                      @focusInput()
                  @context.executeAction SearchActions.executeSearch, ""}
                autosuggestPlaceholder={destinationPlaceholder}
                id='destination'
                className='add-favourite-container__input-placeholder'
              />
            </div>
            <div className="add-favourite-container__give-name">
              <h4><FormattedMessage id="give-name-to-location" defaultMessage="Name the location"/></h4>
              <div className="add-favourite-container__input-placeholder">
                <input
                  className="add-favourite-container__input"
                  placeholder={@context.intl.formatMessage(
                    id: 'location-examples'
                    defaultMessage: 'e.g. Home, Work, Scool,...')}
                  onChange={@specifyName}/>
              </div>
            </div>
            <div className="add-favourite-container__pick-icon">
              <h4><FormattedMessage id="pick-icon" defaultMessage="Select an icon"/></h4>
              <FavouriteIconTable
                selectedIconId={if @state.selectedIconId != 'undefined' or null then @state.selectedIconId else undefined}
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
      <SearchModal
        ref="modal"
        modalIsOpen={@state.searchModalIsOpen}
        selectedTab={"favourite-place"}
        closeModal={@closeSearchModal}>
        <Tab
        className="search-header__button--selected"
        label={searchTabLabel}
        ref="searchTab"
        value={"favourite-place"}>
          <SearchInput
            ref="searchInputfavourite"
            id="search-favourite"
            initialValue = {""}
            onSuggestionSelected = {(name, item) =>
              @setCoordinatesAndAddress(name, item)
              @closeSearchModal()
          }/>
        </Tab>
      </SearchModal>
    </div>


module.exports = AddFavouriteContainer
