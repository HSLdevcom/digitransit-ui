toRad = (deg) -> deg * Math.PI / 180
toDeg = (rad) -> rad * 180 / Math.PI

getBearing = (lat1,lng1,lat2,lng2) ->
  lonScale = Math.cos toRad (lat1+lat2)/2
  dy = lat2-lat1
  dx = (lng2-lng1)*lonScale
  (toDeg(Math.atan2(dx, dy)) + 360) % 360

module.exports =
  getBearing: getBearing
