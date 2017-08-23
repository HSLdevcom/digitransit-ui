import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

import { FormattedMessage } from 'react-intl';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';
import Icon from './Icon';

export default class PrintableItineraryHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itineraryObj: this.props.itinerary,
    };
  }

  render() {
    return <div>Test</div>;
  }
}

PrintableItineraryHeader.propTypes = {
  location: PropTypes.object,
  itinerary: PropTypes.object.isRequired,
};
