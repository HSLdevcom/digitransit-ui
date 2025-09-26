import React from 'react';
import Header from './Header';
import Filters from './Filters';
import Contents from './Contents';

export default function TrafficNow() {
  return (
    <div className="trafficnow-main">
      <div className="tn-centered">
        <Header />
      </div>
      <div className="separator" />
      <div className="trafficnow-bottom tn-centered">
        <Filters />
        <Contents />
      </div>
    </div>
  );
}

TrafficNow.propTypes = {};

TrafficNow.defaultProps = {};
