// Inlined from https://github.com/mapbox/mapbox-gl-js/blob/master/src/style-spec/function/index.js
// In order to avoid needing transpiling node_modules

function interp(a, b, t) {
  return a * (1 - t) + b * t;
}

function findStopLessThanOrEqualTo(stops, input) {
  const n = stops.length;
  let lowerIndex = 0;
  let upperIndex = n - 1;
  let currentIndex = 0;
  let currentValue;
  let upperValue;

  while (lowerIndex <= upperIndex) {
    currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
    [currentValue] = stops[currentIndex];
    [upperValue] = stops[currentIndex + 1];
    if (
      input === currentValue ||
      (input > currentValue && input < upperValue)
    ) {
      // Search complete
      return currentIndex;
    }
    if (currentValue < input) {
      lowerIndex = currentIndex + 1;
    } else if (currentValue > input) {
      upperIndex = currentIndex - 1;
    }
  }

  return Math.max(currentIndex - 1, 0);
}

function interpolationFactor(input, base, lowerValue, upperValue) {
  const difference = upperValue - lowerValue;
  const progress = input - lowerValue;

  if (difference === 0) {
    return 0;
  }
  if (base === 1) {
    return progress / difference;
  }
  return (base ** progress - 1) / (base ** difference - 1);
}

export default function glfun(parameters) {
  return function evaluateExponentialFunction(input) {
    const base = parameters.base !== undefined ? parameters.base : 1;

    const n = parameters.stops.length;
    if (n === 1) {
      return parameters.stops[0][1];
    }
    if (input <= parameters.stops[0][0]) {
      return parameters.stops[0][1];
    }
    if (input >= parameters.stops[n - 1][0]) {
      return parameters.stops[n - 1][1];
    }

    const index = findStopLessThanOrEqualTo(parameters.stops, input);
    const t = interpolationFactor(
      input,
      base,
      parameters.stops[index][0],
      parameters.stops[index + 1][0],
    );

    const outputLower = parameters.stops[index][1];
    const outputUpper = parameters.stops[index + 1][1];

    return interp(outputLower, outputUpper, t);
  };
}
