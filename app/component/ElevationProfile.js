import ceil from 'lodash/ceil';
import React from 'react';
import { Scatter } from 'react-chartjs-2';

const ElevationProfile = ({ itinerary }) => {
  let pointDistance = 0;
  const data = itinerary.legs
    .map(leg => leg.steps)
    .reduce((a, b) => [...a, ...b], [])
    .map(step => step.elevationProfile)
    .reduce((a, b) => [...a, ...b], [])
    .map(point => {
      pointDistance += point.distance || 0;
      return {
        x: ceil(pointDistance, 1),
        y: ceil(point.elevation, 1),
      };
    });
  return (
    <React.Fragment>
      <h2>Korkeusprofiili</h2>
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
                  callback: value => `${ceil(value / 100000, 1)} km`,
                },
                type: 'linear',
              },
            ],
            yAxes: [
              {
                gridLines: { display: false },
                ticks: {
                  callback: value => `${value} m`,
                },
                type: 'linear',
              },
            ],
          },
          tooltips: {
            callbacks: {
              label: ({ yLabel }) => `${ceil(yLabel, 1)} m`,
            },
            intersect: false,
          },
        }}
      />
    </React.Fragment>
  );
};

export default ElevationProfile;
