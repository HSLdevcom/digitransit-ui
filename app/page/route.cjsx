React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
#ItineraryTabs      = require '../component/route/route-tabs'
Tabs               = require 'react-simpletabs'
Map                = require '../component/map/map'
RouteInformationAction = require '../action/route-information-action'
RouteHeaderContainer = require '../component/route/route-header-container'
RouteStopListContainer = require '../component/route/route-stop-list-container'
ItineraryLine      = require '../component/map/itinerary-line'

class RoutePage extends React.Component
  @loadAction: RouteInformationAction.routePageDataRequest

  render: ->
    <DefaultNavigation className="fullscreen">
      <RouteHeaderContainer id={@props.params.routeId}/>
      <Tabs className="route-tabs">
        <Tabs.Panel title="Pysäkit">
          <RouteStopListContainer id={@props.params.routeId}/>
        </Tabs.Panel>
        <Tabs.Panel title="Kartta" className="fullscreen">
          <Map className="fullscreen">
          </Map>
        </Tabs.Panel>
        <Tabs.Panel title="Aikataulut">
          Aikataulut tähän
        </Tabs.Panel>
      </Tabs>
    </DefaultNavigation>

module.exports = RoutePage