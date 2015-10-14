module.exports =
  URL:
    OTP: 'http://digitransit.fi/otp/routers/finland/'
    GEOCODER: 'http://digitransit.fi/geocoder/'
    MAP: 'http://digitransit.fi/hsl-map/'
    MQTT: 'ws://213.138.147.225:1883'
    ALERTS: 'http://matka.hsl.fi/hsl-alert/'
    FONT: 'http://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700'
    REALTIME: 'http://digitransit.fi/navigator-server'
    PELIAS: 'http://digitransit.fi/pelias/v1/autocomplete'
  cities: []
  title: 'Digitransit'
  searchParams: {}
  pelias:
    useNeighbourhood: true
  nearbyRoutes:
    radius: 10000
    bucketSize: 1000
