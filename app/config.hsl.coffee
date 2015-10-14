module.exports =
  URL:
    OTP: 'http://matka.hsl.fi/otp/routers/finland/'
    GEOCODER: 'http://matka.hsl.fi/geocoder/'
    MAP: 'http://matka.hsl.fi/hsl-map/'
    MQTT: 'ws://213.138.147.225:1883'
    ALERTS: 'http://matka.hsl.fi/hsl-alert/'
    FONT: 'http://fonts.googleapis.com/css?family=Nunito:300,400,700%7COpen+Sans+Condensed:300,700'
    REALTIME: 'http://matka.hsl.fi/navigator-server'
    PELIAS: 'http://matka.hsl.fi/pelias/v1/search'
  title: 'Digitransit (HSL)'
  icon: 'hsl-icon.png'
  preferredAgency: 'HSL'
  cities: ["helsinki", "vantaa", "espoo", "kauniainen", "kerava", "kirkkonummi", "sipoo"]
  searchParams:
    "boundary.rect.min_lat": 59.9
    "boundary.rect.max_lat": 60.45
    "boundary.rect.min_lon": 24.3
    "boundary.rect.max_lon": 25.5
  pelias:
    useNeighbourhood: false
  nearbyRoutes:
    radius: 2000
    bucketSize: 100
