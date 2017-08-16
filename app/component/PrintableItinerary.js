import PropTypes from 'prop-types';
import React from 'react';

export default class PrintableItinerary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.location.state.itineraryObj,
    };
  }

  render() {
    return <div />;
  }
}

PrintableItinerary.propTypes = {
  location: PropTypes.object,
};
