React              = require 'react'
Icon               = require '../component/icon/icon'
Link               = require('react-router/lib/Link').Link


class TypographyPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired


  getColors: ->
    return (
      <section>
        <div className="medium-6 column">
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#007ac9'}/>
          </svg>
          <span className="code color-code">$primary-color</span>#007ac9
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#ffffff'}/>
          </svg>
          <span className="code color-code">$primary-font-color</span>#ffffff
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#0062a1'}/>
          </svg>
          <span className="code color-code">$secondary-color</span>#0062a1
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#ffffff'}/>
          </svg>
          <span className="code color-code">$secondary-font-color</span>#ffffff
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#ffffff'}/>
          </svg>
          <span className="code color-code">$title-color</span>#ffffff
          <br />
        </div>
        <div className="medium-6 column">
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#f092cd'}/>
          </svg>
          <span className="code color-code">$favourite-color</span>#f092cd
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#f092cd'}/>
          </svg>
          <span className="code color-code">$hilight-color</span>#f092cd
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#007ac9'}/>
          </svg>
          <span className="code color-code">$action-color</span>#007ac9
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#FED103'}/>
          </svg>
          <span className="code color-code">$disruption-color</span>#FED103
          <br />
          <svg className="color-palette" width="50" height="50">
            <rect width="50" height="50" style={fill:'#4DA2D9'}/>
          </svg>
          <span className="code color-code">$disruption-passive-color</span>#4DA2D9
        </div>
      </section>
    );

  getFonts: ->
    return (
      <section>
        <span className="code">$font-family</span>
        <p style={{fontWeight: '300 '}}>Primary font narrow - Weight 300: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-light</span></p>
        <p style={{fontWeight: '400 '}}>Primary font normal - Weight 400: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-normal</span></p>
        <p style={{fontWeight: '600 '}}>Primary font bold   - Weight 600: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-bold</span></p>
        <span className="code">$font-family-narrow</span>
        <p style={fontFamily: 'Open Sans Condensed', fontWeight:'400'}>Secondary font: 'Open Sans Condensed', 'Arial Condensed', Arial, Georgia, Serif<span className="code">$font-weight-normal</span></p>
        <p style={fontFamily: 'Open Sans Condensed', fontWeight:'600'}>Secondary font: 'Open Sans Condensed', 'Arial Condensed', Arial, Georgia, Serif<span className="code">$font-weight-bold</span></p>
      </section>
    );

  getHeadings: ->
    <section>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </section>

  getIcons: ->
    <section>
      Import: <p className="code">Icon = require '../icon/icon'</p><br />
      <div className="medium-4 column">
        <Icon img={'icon-icon_arrow-collapse'}/>
        <span className="code">icon-icon_arrow-collapse</span><br />
        <Icon img={'icon-icon_arrow-down'}/>
        <span className="code">icon-icon_arrow-down</span><br />
        <Icon img={'icon-icon_arrow-dropdown'}/>
        <span className="code">icon-icon_arrow-dropdown</span><br />
        <Icon img={'icon-icon_arrow-left'}/>
        <span className="code">icon-icon_arrow-left</span><br />
        <Icon img={'icon-icon_arrow-right'}/>
        <span className="code">icon-icon_arrow-right</span><br />
        <Icon img={'icon-icon_arrow-up'}/>
        <span className="code">icon-icon_arrow-up</span><br />
        <Icon img={'icon-icon_bus-stop'}/>
        <span className="code">icon-icon_bus-stop</span><br />
        <Icon img={'icon-icon_bus-withoutBox'}/>
        <span className="code">icon-icon_bus-withoutBox</span><br />
        <Icon img={'icon-icon_bus'}/>
        <span className="code">icon-icon_bus</span><br />
        <Icon img={'icon-icon_car'}/>
        <span className="code">icon-icon_car</span><br />
        <Icon img={'icon-icon_caution'}/>
        <span className="code">icon-icon_caution</span><br />
        <Icon img={'icon-icon_close'}/>
        <span className="code">icon-icon_close</span><br />
        <Icon img={'icon-icon_cycle'}/>
        <span className="code">icon-icon_cycle</span><br />
        <Icon img={'icon-icon_cyclist'}/>
        <span className="code">icon-icon_cyclist</span><br />
        <Icon img={'icon-icon_direction-a'}/>
        <span className="code">icon-icon_direction-a</span><br />
        <Icon img={'icon-icon_direction-b'}/>
        <span className="code">icon-icon_direction-b</span><br />
      </div>
      <div className="medium-4 column">
        <Icon img={'icon-icon_ellipsis'}/>
        <span className="code">icon-icon_ellipsis</span><br />
        <Icon img={'icon-icon_ferry-withoutBox'}/>
        <span className="code">icon-icon_ferry-withoutBox</span><br />
        <Icon img={'icon-icon_ferry'}/>
        <span className="code">icon-icon_ferry</span><br />
        <Icon img={'icon-icon_HSL-logo'}/>
        <span className="code">icon-icon_HSL-logo</span><br />
        <Icon img={'icon-icon_info'}/>
        <span className="code">icon-icon_info</span><br />
        <Icon img={'icon-icon_kutsuplus'}/>
        <span className="code">icon-icon_kutsuplus</span><br />
        <Icon img={'icon-icon_mapMarker-location'}/>
        <span className="code">icon-icon_mapMarker-location</span><br />
        <Icon img={'icon-icon_mapMarker-point'}/>
        <span className="code">icon-icon_mapMarker-point</span><br />
        <Icon img={'icon-icon_maximize'}/>
        <span className="code">icon-icon_maximize</span><br />
        <Icon img={'icon-icon_menu'}/>
        <span className="code">icon-icon_menu</span><br />
        <Icon img={'icon-icon_minimize'}/>
        <span className="code">icon-icon_minimize</span><br />
        <Icon img={'icon-icon_pause'}/>
        <span className="code">icon-icon_pause</span><br />
        <Icon img={'icon-icon_place'}/>
        <span className="code">icon-icon_place</span><br />
        <Icon img={'icon-icon_plus'}/>
        <span className="code">icon-icon_plus</span><br />
        <Icon img={'icon-icon_print'}/>
        <span className="code">icon-icon_print</span><br />
      </div>
      <div className="medium-4 column">
        <Icon img={'icon-icon_rail-withoutBox'}/>
        <span className="code">icon-icon_rail-withoutBox</span><br />
        <Icon img={'icon-icon_rail'}/>
        <span className="code">icon-icon_rail</span><br />
        <Icon img={'icon-icon_route'}/>
        <span className="code">icon-icon_route</span><br />
        <Icon img={'icon-icon_search'}/>
        <span className="code">icon-icon_search</span><br />
        <Icon img={'icon-icon_share'}/>
        <span className="code">icon-icon_share</span><br />
        <Icon img={'icon-icon_star'}/>
        <span className="code">icon-icon_star</span><br />
        <Icon img={'icon-icon_station'}/>
        <span className="code">icon-icon_station</span><br />
        <Icon img={'icon-icon_subway-withoutBox'}/>
        <span className="code">icon-icon_subway-withoutBox</span><br />
        <Icon img={'icon-icon_subway'}/>
        <span className="code">icon-icon_subway</span><br />
        <Icon img={'icon-icon_time'}/>
        <span className="code">icon-icon_time</span><br />
        <Icon img={'icon-icon_tram-withoutBox'}/>
        <span className="code">icon-icon_tram-withoutBox</span><br />
        <Icon img={'icon-icon_tram'}/>
        <span className="code">icon-icon_tram</span><br />
        <Icon img={'icon-icon_user'}/>
        <span className="code">icon-icon_user</span><br />
        <Icon img={'icon-icon_waiting'}/>
        <span className="code">icon-icon_waiting</span><br />
        <Icon img={'icon-icon_walk'}/>
        <span className="code">icon-icon_walk</span><br />
        <Icon img={'icon-icon_mapMarker-location-animated'}/>
        <span className="code">icon-icon_mapMarker-location-animated</span><br />
      </div>
    </section>



  render: ->

    <div className="container column typography">
      <div className="sub-header">Colors</div>
      {@getColors()}

      <hr></hr>
      <div className="sub-header">Fonts</div>
      {@getFonts()}

      <hr></hr>
      <div className="sub-header">Headings</div>
      {@getHeadings()}

      <hr></hr>
      <div className="sub-header">Icons</div>
      {@getIcons()}

      <hr></hr>
      <div className="sub-header"></div>
      <a href="#">This is a link</a>

    </div>



module.exports = TypographyPage
