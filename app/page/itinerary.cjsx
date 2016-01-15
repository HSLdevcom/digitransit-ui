React              = require 'react'
Helmet             = require 'react-helmet'
DefaultNavigation  = require '../component/navigation/default-navigation'
Slider             = require 'react-slick'
BottomNavigation   = require '../component/itinerary/bottom-navigation'
ItineraryTabs      = require '../component/itinerary/itinerary-tabs'
intl               = require 'react-intl'

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

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

    meta =
      title: @context.intl.formatMessage {id: 'itinerary-page.title', defaultMessage: "Route"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-page.description', defaultMessage: "Route"}}
      ]

    <DefaultNavigation className="fullscreen">
      <Helmet {...meta} />
      <Slider {...settings}>
        {slides}
      </Slider>
      <BottomNavigation params={@props.params}/>
    </DefaultNavigation>

module.exports = ItineraryPage
