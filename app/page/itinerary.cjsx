React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Slider             = require 'react-slick'
BottomNavigation   = require '../component/itinerary/bottom-navigation'
ItineraryTabs      = require '../component/itinerary/itinerary-tabs'

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  render: ->
    plan = @context.getStore('ItinerarySearchStore').getData().plan
    unless plan
      return <DefaultNavigation className="fullscreen"/>
    itineraries = plan.itineraries
    slides = []

    itineraries.forEach (itinerary, i) ->
      slides.push <div key={i}><ItineraryTabs itinerary={itinerary} index={i}/></div>

    settings =
      arrows: true
      dots: true
      infinite: false
      initialSlide: parseInt(@props.params.hash)
      swipeToSlide: true

    <DefaultNavigation className="fullscreen">
      <Slider {...settings}>
        {slides}
      </Slider>
      <BottomNavigation params={@props.params}/>
    </DefaultNavigation>

module.exports = ItineraryPage
