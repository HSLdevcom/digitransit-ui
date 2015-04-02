React = require('react')
Locate = require('../locate.cjsx')

Map = React.createClass

  render: ->
    <div className="map">
      <form className="search-form">
        <div className="row">
          <div className="small-12 medium-6 medium-offset-3 columns">
            <div className="row collapse prefix-and-postfix-radius">
              <Locate/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="small-12 medium-6 medium-offset-3 columns">
            <div className="row collapse postfix-radius">
              <div className="small-11 columns">
                <input type="text" placeholder="Määränpään osoite, linja, pysäkki tai aika" />
              </div>
              <div className="small-1 columns">
                <span className="postfix search"><i className="icon icon-search"></i></span>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="fullscreen-toggle"></div>
    </div>

module.exports = Map