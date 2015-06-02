React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Slider             = require 'react-slick'
moment             = require 'moment'
Icon               = require '../component/icon/icon'
Tabs               = require 'react-simpletabs'
TransitLeg         = require '../component/itinerary/transit-leg'
WalkLeg            = require '../component/itinerary/walk-leg'
EndLeg             = require '../component/itinerary/end-leg'
TicketInformation  = require '../component/itinerary/ticket-information'
Link               = require 'react-router/lib/components/Link'

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    plan = @context.getStore('RouteSearchStore').getData().plan
    itineraries = plan.itineraries
    selectedItinerary = itineraries[@props.params.hash]
    slides = []

    itineraries.forEach (itinerary, i) ->
      objs = [<TicketInformation/>]
      legs = itinerary.legs.length
      itinerary.legs.forEach (leg, j) ->
        if leg.transitLeg
          objs.push <TransitLeg index={j} leg={leg}/>
        else
          objs.push <WalkLeg index={j} leg={leg} legs={legs}/>
      objs.push <EndLeg index={itinerary.legs.length} endTime={itinerary.endTime} to={plan.to.name}/>
      slides.push <div key={i}>{objs}</div>

    settings =
      arrows: true
      dots: true
      infinite: false
      initialSlide: parseInt(@props.params.hash)
      swipeToSlide: true

    <DefaultNavigation className="fullscreen">
      <div className="itinerary-summary">
        <Icon img={'icon-icon_time'}/><span className="itinerary-summary-duration"> {Math.round(selectedItinerary.duration/60)}min </span>
        // {moment(selectedItinerary.startTime).format('HH:mm')} - {moment(selectedItinerary.endTime).format('HH:mm')} 
        &nbsp;&nbsp;<Icon img={'icon-icon_walk'}/> {Math.round(selectedItinerary.walkDistance/100)*100}m
      </div>
      <Tabs className="itinerary-tabs">
        <Tabs.Panel title="Ohjeet" className="fullscreen">
          <Slider {...settings}>
            {slides}
          </Slider>
        </Tabs.Panel>
        <Tabs.Panel title="Kartta">
          Kartta Tähän
        </Tabs.Panel>
      </Tabs>
      <div className="itinerary-bottom-navigation row">
        <div className="small-4 columns">
          <Icon img={'icon-icon_share'}/> Jaa Ohje
        </div>
        <div className="small-4 columns">
          <Icon img={'icon-icon_print'}/> Tulosta
        </div>
        <div className="small-4 columns navigate">
          <Link to="navigate" params={{from: @props.params.from, to:@props.params.to, hash:@props.params.hash}}>
           <Icon img={'icon-icon_arrow-right'}/> Navigoi
          </Link>
        </div>
      </div>
    </DefaultNavigation>

module.exports = ItineraryPage