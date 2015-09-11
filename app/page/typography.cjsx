React              = require 'react'
Icon               = require '../component/icon/icon'
Link               = require('react-router/lib/Link').Link

class TypographyPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired

  componentDidMount: ->

  # TODO: separate into funcitons. example: get headers
  render: ->
    <div className="container">
      <div className="">Colors</div>
      <div className="row">
        <div className="small-6">
          <div className="">HSL</div>
          $primary-color<br/>
          $primary-font-color<br/>
          $secondary-color<br/>
          $secondary-font-color<br/>
          $title-color<br/>
          $favourite-color<br/>
          $hilight-color<br/>
          $action-color<br/>
          $disruption-color<br/>
          $disruption-passive-color<br/>
        </div>
        <div className="small-6">
          <div className="">Liikennevirasto</div>
          $primary-color<br/>
          $primary-font-color<br/>
          $secondary-color<br/>
          $secondary-font-color<br/>
          $title-color<br/>
          $favourite-color<br/>
          $hilight-color<br/>
          $action-color<br/>
          $disruption-color<br/>
          $disruption-passive-color<br/>
        </div>
      </div>

      <hr></hr>
      <div className="sub-header">Fonts</div>
      <span className="code">$font-family</span>
      <p style={{fontWeight: '300 '}}>Primary font narrow - Weight 300: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-light</span></p>
      <p style={{fontWeight: '400 '}}>Primary font normal - Weight 400: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-normal</span></p>
      <p style={{fontWeight: '600 '}}>Primary font bold   - Weight 600: "Nunito, Arial, Georgia, Serif"<span className="code">$font-weight-bold</span></p>

      <span className="code">$font-family-narrow</span>
      <p>Secondary font: 'Open Sans Condensed', 'Arial Condensed', Arial, Georgia, Serif</p>

      <hr></hr>

      <div className="">Headings</div>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>

      <hr></hr>

      <div className="">Fonts</div>
      <div className="row">
        <div className="small-6">
          <div className="">HSL</div>

        </div>
        <div className="small-6">
          <div className="">Liikennevirasto</div>

        </div>
      </div>

    </div>



module.exports = TypographyPage
