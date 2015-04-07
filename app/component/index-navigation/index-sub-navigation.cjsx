React = require 'react'

class IndexSubNavigation extends React.Component

  propTypes =
    visible: React.PropTypes.bool.isRequired

  render: ->
    if not @props.visible
      return null

    <div className="sub-navigation">
      <div className="row">
        <div className="small-12 columns">
          <div className="arrow-up"></div>
          <form>
            <input type="text" className="time hour" value="14"/>:<input type="text" className="time minute" value="12"/>
            <select>
              <option>Tänään</option>
              <option>Huomenna</option>
            </select>
            <select>
              <option>Lähtöaika</option>
              <option>Saapumisaika</option>
            </select>
          </form>
        </div>
      </div>
    </div>

module.exports = IndexSubNavigation
