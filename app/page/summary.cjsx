React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
RouteSearchActions = require '../action/route-search-action'
SummaryRow         = require '../component/summary/summary-row'

class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @loadAction: RouteSearchActions.routeSearchRequest

  componentDidMount: -> 
    @context.getStore('RouteSearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteSearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    rows = []
    if @context.getStore('RouteSearchStore').getData().plan
      for data, i in @context.getStore('RouteSearchStore').getData().plan.itineraries
        rows.push <SummaryRow key={i} data={data}/> 

    <DefaultNavigation className="fullscreen">
      <Map>
        <div className="search-form">
          <div className="row">
            <div className="small-12 medium-6 medium-offset-3 columns">
              <div className="row collapse postfix-radius">
                <div className="small-12 columns">
                  <input type="text" disabled value={@props.params.from.split("::")[0]}/>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="small-12 medium-6 medium-offset-3 columns">
              <div className="row collapse postfix-radius">
                <div className="small-12 columns">
                  <input type="text" disabled value={@props.params.to.split("::")[0]}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Map>
      <div>{rows}</div>
    </DefaultNavigation>

module.exports = SummaryPage