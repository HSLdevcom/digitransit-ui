React = require('react');
Slideout = require('slideout')
$ = require('jquery') 

IndexOffcanvas = React.createClass
  componentDidMount: -> 
    slideout = new Slideout
      'panel': document.getElementById('main'),
      'menu': document.getElementById('offcanvas-left'),
      'padding': 256,
      'tolerance': 70

    $('#reveal-left-offcanvas').click () -> 
      slideout.toggle()

  render: ->
    <nav id="offcanvas-left" className="offcanvas-menu">
      <header className="offcanvas-header offcanvas-section">
        <p className="offcanvas-lead">
            Kirjautumalla palveluun saat suosikit talteen ja voit hyödyntää niitä muillakin laitteillasi
        </p>
        <div className="offcanvas-login">
          <div className="inline-block">
            <i className="icon icon-profile"></i>
          </div>
          <div className="inline-block">  
            <p>
              <a href="#">Luo tunnus <i className="icon icon-arrow-right"></i></a>
            </p>
            <p>
              <a href="#">Kirjaudu sisään <i className="icon icon-arrow-right"></i></a>
            </p>
          </div>
        </div> 
      </header>
      
      <section className="offcanvas-section">
        <ul className="offcanvas-list">
          <li><a href="#">Matkaliput <i className="icon icon-arrow-right"></i></a></li>
          <li><a href="#">Linjat <i className="icon icon-arrow-right"></i></a></li>
          <li><a href="#">Pysäkit <i className="icon icon-arrow-right"></i></a></li>
          <li><a href="#">Asetukset <i className="icon icon-arrow-right"></i></a></li>
          <li><a href="#">Käyttöehdot <i className="icon icon-arrow-right"></i></a></li>
          <li><a href="#">HSL:n yhteystiedot <i className="icon icon-arrow-right"></i></a></li>
        </ul>
      </section>
    </nav>


module.exports = IndexOffcanvas