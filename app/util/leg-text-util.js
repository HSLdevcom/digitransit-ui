
// Returns either a route number, single transit character or empty string

var MAX_ROUTE_LENGTH = 6;

var getLegText = function(leg) {
  if (leg.transitLeg && leg.mode.toLowerCase() == 'subway') {
    // TODO: Translate these characters.
    return " M";
  }
  else if (leg.transitLeg && leg.route.length < MAX_ROUTE_LENGTH) {
    // Some route values are too long. Other routes are simply just a number.
    return " " + leg.route;
  }
  else {
    return "";
  }
}

module.exports = {
  getLegText: getLegText
}
