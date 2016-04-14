
// Returns either a route number, single transit character or empty string

var MAX_ROUTE_LENGTH = 6;

var getLegText = function(leg) {
  if (leg.transitLeg && leg.mode.toLowerCase() == 'subway') {
    // TODO: Translate these characters.
    return "M";
  }
  else if (leg.transitLeg && leg.route.shortName && leg.route.shortName.length < MAX_ROUTE_LENGTH) {
    // Some route values are too long. Other routes are simply just a number.
    return leg.route.shortName;
  }
  else {
    return "";
  }
}

module.exports = {
  getLegText: getLegText
}
