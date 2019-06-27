import ceil from 'lodash/ceil';
import React from 'react';
import { Scatter } from 'react-chartjs-2';

import { displayDistance } from '../util/geo-utils';

const FONT_FAMILY =
  '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif';

const ElevationProfile = ({ config, itinerary }) => {
  if (
    !itinerary ||
    !Array.isArray(itinerary.legs) ||
    itinerary.legs.some(leg => leg.transitLeg)
  ) {
    return null;
  }

  let cumulativeStepDistance = 0;
  const data = itinerary.legs
    .map(leg => leg.steps)
    .reduce((a, b) => [...a, ...b], [])
    .map((step, i, stepsArray) => {
      cumulativeStepDistance +=
        (stepsArray[i - 1] && stepsArray[i - 1].distance) || 0;
      return step.elevationProfile.map(ep => ({
        elevation: ceil(ep.elevation, 1),
        distance: ep.distance,
        stepDistance: cumulativeStepDistance,
      }));
    })
    .reduce((a, b) => [...a, ...b], [])
    .map(point => ({
      x: ceil(point.stepDistance + point.distance, 1),
      y: point.elevation,
    }));

  const firstElement = data[0] && data[0];
  if (firstElement && firstElement.x !== 0) {
    data.unshift({ x: 0, y: firstElement.y });
  }

  return (
    <React.Fragment>
      <Scatter
        data={{ datasets: [{ data, pointRadius: 0, showLine: true }] }}
        options={{
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                gridLines: { display: false },
                ticks: {
                  beginAtZero: true,
                  callback: value => `${ceil(value / 1000, 1)} km`,
                  fontFamily: FONT_FAMILY,
                  max: data[data.length - 1].x,
                  maxTicksLimit: 9,
                  stepSize: 1000,
                },
                type: 'linear',
              },
            ],
            yAxes: [
              {
                gridLines: { display: false },
                ticks: {
                  callback: value => `${value} m`,
                  fontFamily: FONT_FAMILY,
                  maxTicksLimit: 5,
                  stepSize: 1,
                },
                type: 'linear',
              },
            ],
          },
          tooltips: {
            bodyFontFamily: FONT_FAMILY,
            callbacks: {
              label: ({ xLabel, yLabel }) =>
                `${ceil(yLabel, 1)} m, ${
                  xLabel < 1000
                    ? `${Math.round(xLabel / 10) * 10} m`
                    : displayDistance(xLabel, config)
                }`,
            },
            intersect: false,
            mode: 'index',
          },
        }}
        height={1}
        width={4}
      />
    </React.Fragment>
  );
};

export default ElevationProfile;
