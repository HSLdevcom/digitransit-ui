React = require('react')
Tabs = require('react-simpletabs')

StopTabs = React.createClass
  
  contextTypes: 
    router: React.PropTypes.func

  render: -> 
    router = this.context.router

    <Tabs>
      <Tabs.Panel title="Lähimmät">
        <div className="row">
          <div className="stop-cards">
            <div className="small-12 medium-6 large-4 columns">
              <div className="stop-card cursor-pointer" onClick={() => router.transitionTo('/pysakit/2166')}>
                <span className="favourite"><i className="icon icon-favourite"></i></span>
                <h3>Ratamestarinkatu ›</h3>
                <p className="location">Asemapäällikönk. 8 // 2166 // 88m</p>
                <p className="transport">
                  <span className="next-departure">14:44</span>
                  <span className="following-departure">15:04</span>
                  <i className="icon icon-bus bus"></i>
                  <span className="vehicle-number bus">504</span>
                  <i className="icon icon-arrow-right bus"></i>
                  <span className="destination">Kivenlahti</span>
                </p>
              </div>
            </div>
            <div className="small-12 medium-6 large-4 columns">
              <div className="stop-card cursor-pointer" onClick={() => router.transitionTo('/pysakit/0662')}>
                <span className="favourite"><i className="icon icon-favourite"></i></span>
                <h3>Asemapäällikönkatu ›</h3>
                <p className="location">Ratamestarinkatu // 0662 // 120m</p>
                <p className="transport">
                  <span className="next-departure">3 min</span>
                  <span className="following-departure">10 min</span>
                  <i className="icon icon-tram tram"></i>
                  <span className="vehicle-number tram">9</span>
                  <i className="icon icon-arrow-right tram"></i>
                  <span className="destination">Pasila</span>
                </p>
              </div>
            </div>
            <div className="small-12 medium-6 large-4 columns end">
              <div className="stop-card">
                <span className="favourite selected"><i className="icon icon-favourite"></i></span>
                <h3>Pyöräilystadion ›</h3>
                <p className="location">Ratamestarinkatu // 2430 // 560m</p>
                <p className="transport">
                  <span className="next-departure">0 min</span>
                  <span className="following-departure">10 min</span>
                  <i className="icon icon-bus bus"></i>
                  <span className="vehicle-number bus">615</span>
                  <i className="icon icon-arrow-right bus"></i>
                  <span className="destination">Rautatientori</span>
                </p>
                <p className="transport">
                  <span className="next-departure">0 min</span>
                  <span className="following-departure">9 min</span>
                  <i className="icon icon-bus bus"></i>
                  <span className="vehicle-number bus">620</span>
                  <i className="icon icon-arrow-right bus"></i>
                  <span className="destination">Rautatientori</span>
                </p>
                <p className="transport">
                  <span className="next-departure">14:31</span>
                  <span className="following-departure">15:31</span>
                  <i className="icon icon-bus bus"></i>
                  <span className="vehicle-number bus">15</span>
                  <i className="icon icon-arrow-right bus"></i>
                  <span className="destination">Pasila</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel title='Edelliset'>
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title='Suosikit'>
        <h2>Suosikit tähän</h2>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs