import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { Line } from 'react-chartjs-2';

import { displayDistance } from '../util/geo-utils';
import { LegMode } from '../util/legUtils';
import { getModeColor } from '../util/mapIconUtils';

const FONT_COLOR = '#666';
const FONT_FAMILY =
  '"Gotham Rounded SSm A", "Gotham Rounded SSm B", Arial, Georgia, Serif';

const ElevationProfile = ({ config, itinerary }) => {
  if (
    !itinerary ||
    !Array.isArray(itinerary.legs) ||
    itinerary.legs.length === 0 ||
    itinerary.legs.some(leg => leg.transitLeg)
  ) {
    return null;
  }

  const datasets = [];
  let cumulativeStepDistance = 0;

  itinerary.legs.forEach(leg => {
    const data = leg.steps
      .map((step, i, stepsArray) => {
        cumulativeStepDistance +=
          (stepsArray[i - 1] && stepsArray[i - 1].distance) || 0;
        return step.elevationProfile
          .filter(ep => ep.distance <= step.distance)
          .map(ep => ({
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

    const mode =
      (leg.mode === LegMode.Bicycle && leg.rentedBike && LegMode.CityBike) ||
      (leg.mode === LegMode.Bicycle && LegMode.Bicycle) ||
      LegMode.Walk;
    datasets.push({
      mode,
      data,
    });
  });

  if (datasets.length === 0 || datasets.every(ds => ds.data.length === 0)) {
    return null;
  }

  return (
    <div style={{ margin: '1em 0' }}>
      <Line
        data={{
          datasets: datasets.map((ds, i) => ({
            borderColor: getModeColor(ds.mode),
            data: ds.data,
            label: `step_${i}`,
            lineTension: 0,
            pointHoverRadius: 0,
            pointRadius: 0,
          })),
        }}
        options={{
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                gridLines: { display: false, drawBorder: false },
                ticks: {
                  beginAtZero: true,
                  callback: value => `${ceil(value / 1000, 1)} km`,
                  fontColor: FONT_COLOR,
                  fontFamily: FONT_FAMILY,
                  max: itinerary.legs
                    .map(leg => leg.distance)
                    .reduce((a, b) => a + b, 0),
                  maxTicksLimit: 7,
                  stepSize: 1000,
                },
                type: 'linear',
              },
            ],
            yAxes: [
              {
                gridLines: { display: false, drawBorder: false },
                ticks: {
                  callback: value => `${value} m`,
                  fontColor: FONT_COLOR,
                  fontFamily: FONT_FAMILY,
                  maxTicksLimit: 4,
                  stepSize: 5,
                },
                type: 'linear',
              },
            ],
          },
          tooltips: {
            bodyFontFamily: FONT_FAMILY,
            callbacks: {
              label: ({ xLabel, yLabel }) =>
                `${ceil(yLabel, 1)} m (${
                  xLabel < 1000
                    ? `${Math.round(xLabel / 10) * 10} m`
                    : displayDistance(xLabel, config)
                })`,
              title: () => null,
            },
            cornerRadius: 4,
            displayColors: false,
            intersect: false,
            mode: 'nearest',
          },
        }}
        height={1}
        width={3}
      />
    </div>
  );
};

ElevationProfile.propTypes = {
  config: PropTypes.object.isRequired,
  itinerary: PropTypes.object.isRequired,
};

export default ElevationProfile;
