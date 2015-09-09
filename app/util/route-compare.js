module.exports = function (a, b) {
  var partsA = (a.shortName || "").match(/^[A-Za-z]?(0*)([0-9]*)/);
  var partsB = (b.shortName || "").match(/^[A-Za-z]?(0*)([0-9]*)/);
  if (partsA[1].length != partsB[1].length) {
    if (partsA[1].length + partsA[2].length == 0) {
      return -1; // A is the one with no numbers at all, wins leading zero
    } else if (partsB[1].length + partsB[2].length == 0) {
      return 1; // B is the one with no numbers at all, wins leading zero
    } else {
      return partsB[1].length - partsA[1].length; // more leading zeros wins
    }
  }
  var numberA = parseInt(partsA[2] || "0", 10);
  var numberB = parseInt(partsB[2] || "0", 10);
  return numberA - numberB || (a.shortName || "").localeCompare(b.shortName || "") || (a.longName ||
    "").localeCompare(b.longName || "");
}
