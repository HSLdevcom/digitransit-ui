import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
// import { routerShape } from 'react-router';
// import Relay from 'react-relay/classic';
import Icon from './Icon';

const BikeWalkPromotion = (props, context) => (
  <div className="biking-walk-promotion-container">
    {console.log(props)}
    {props.bikingPromotion && (
      <div className="promotion-block biking">
        <div className="icon-container">
          <Icon img="icon-icon_biking" />
        </div>
        <div className="biking-details">
          <span className="by-bike">
            {context.intl.formatMessage({
              id: 'bicycle',
              defaultMessage: 'By Bike',
            })}
          </span>
          <span className="duration">
            {`${Math.round(
              props.bikingPromotion.duration / 60,
            )} ${context.intl.formatMessage({
              id: 'number-of-minutes',
              defaultMessage: 'min',
            })}`}
          </span>
        </div>
        <div className="icon-container-arrow">
          <Icon img="icon-icon_arrow-collapse--right" />
        </div>
      </div>
    )}
    {props.walkingPromotion && (
      <div className="promotion-block walking">
        <div className="icon-container">
          <Icon img="icon-icon_walk" />
        </div>
        <div className="walking-details">
          <span className="by-walking">
            {context.intl.formatMessage({
              id: 'by-walking',
              defaultMessage: 'min',
            })}
          </span>
          <span className="duration">
            {`${Math.round(
              props.walkingPromotion.duration / 60,
            )} ${context.intl.formatMessage({
              id: 'number-of-minutes',
              defaultMessage: 'min',
            })}`}
          </span>
        </div>
        <div className="icon-container-arrow">
          <Icon img="icon-icon_arrow-collapse--right" />
        </div>
      </div>
    )}
  </div>
);

BikeWalkPromotion.propTypes = {
  bikingPromotion: PropTypes.array,
  walkingPromotion: PropTypes.array,
};

BikeWalkPromotion.contextTypes = {
  intl: intlShape.isRequired,
};

export default BikeWalkPromotion;
