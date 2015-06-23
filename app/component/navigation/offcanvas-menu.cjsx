React     = require 'react'
Icon      = require '../icon/icon'
Offcanvas = require '../util/offcanvas'

class OffcanvasMenu extends React.Component
  render: ->
    <Offcanvas open={@props.open} position="left">
      <header className="offcanvas-header offcanvas-section">
        <p className="offcanvas-lead">
            Kirjautumalla palveluun saat suosikit talteen ja voit hyödyntää niitä muillakin laitteillasi
        </p>
        <div className="offcanvas-login">
          <div className="inline-block">
            <Icon img={'icon-icon_user'} className="large"/>
          </div>
          <div className="inline-block">
            <p>
              <a href="#">Luo tunnus <Icon img={'icon-icon_arrow-right'} className="small"/></a>
            </p>
            <p>
              <a href="#">Kirjaudu sisään <Icon img={'icon-icon_arrow-right'} className="small"/></a>
            </p>
          </div>
        </div>
      </header>

      <section className="offcanvas-section">
        <ul className="offcanvas-list">
          <li><a href="#">Matkaliput <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#">Linjat <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#">Pysäkit <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#">Asetukset <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#">Käyttöehdot <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
          <li><a href="#">HSL:n yhteystiedot <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
        </ul>
      </section>
    </Offcanvas>

module.exports = OffcanvasMenu
