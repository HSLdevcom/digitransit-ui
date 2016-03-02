realtimeDeparture =
  stop:
    code: "4611"
  stoptime: 1444165199
  realtime: true
  pattern:
    __dataID__: "UGF0dGVybjpIU0w6NDYxMToxOjAx"
    route:
      __dataID__: "Um91dGU6SFNMOjQ2MTE="
      gtfsId: "HSL:4611"
      shortName: "611"
      longName: "Rautatientori - Siltamäki - Suutarila - Tikkurila"
      type: "BUS"
      color: null
    code: "HSL:4611:1:01"
    headsign: "Rautatientori"

departure =
  stop:
    code: "1007"
  stoptime: 1444185960
  realtime: false
  pattern:
    __dataID__: "UGF0dGVybjpIU0w6MTAwN0I6MDowMg=="
    route:
      __dataID__: "Um91dGU6SFNMOjEwMDdC"
      gtfsId: "HSL:1007B"
      shortName: "7B"
      longName: "Senaatintori-Pasila-Töölö-Senaatintori"
      type: "TRAM"
      color: null
    code: "HSL:1007B:0:02"
    headsign: "Pasila"

currentTime = new Date().getTime() / 1000

station =
  bikesAvailable: 1
  spacesAvailable: 1
  id: "Fredrikinkatu_27[24.940-60.163]"
  name: "Fredrikinkatu 27"
  x: 24.939603788199364
  y: 60.1626075196532

favouriteLocation =
  locationName: "Työ"
  favouriteLocationIconId: "icon-icon_place"
  arrivalTime: "14:38"
  departureTime: "3 min"
  realtime: true


module.exports =
  realtimeDeparture: realtimeDeparture
  departure: departure
  currentTime: currentTime
  station: station
  favouriteLocation: favouriteLocation
