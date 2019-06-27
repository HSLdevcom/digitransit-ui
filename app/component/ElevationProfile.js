import ceil from 'lodash/ceil';
import React from 'react';
import { Scatter } from 'react-chartjs-2';

const ElevationProfile = ({ itinerary }) => {
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
      cumulativeStepDistance += (i > 0 && stepsArray[i - 1].distance) || 0;
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
                  maxTicksLimit: 5,
                  stepSize: 1,
                },
                type: 'linear',
              },
            ],
          },
          tooltips: {
            callbacks: {
              label: ({ xLabel, yLabel }) =>
                `${ceil(yLabel, 1)} m, ${ceil(xLabel / 1000, 1)} km`,
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
