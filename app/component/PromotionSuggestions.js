import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
// import { routerShape } from 'react-router';
// import Relay from 'react-relay/classic';
import Icon from './Icon';

const PromotionSuggestions = (props, context) => (
  <React.Fragment>
    {console.log(props)}
    {props.promotionSuggestion && (
      <div
        className={`promotion-block ${props.textId}`}
        onClick={() => props.onSelect(props.hash, props.mode)}
        role="button"
        tabIndex={0}
        onKeyPress={() => props.onSelect(props.hash, props.mode)}
      >
        <div className="icon-container">
          <Icon img={`icon-icon_${props.iconName}`} />
        </div>
        <div className="suggestion-details">
          <span className={`by-${props.textId}`}>
            {context.intl.formatMessage({
              id: props.textId,
              defaultMessage: props.textId,
            })}
          </span>
          <span className="duration">
            {`${Math.round(
              props.promotionSuggestion.duration / 60,
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
  </React.Fragment>
);

PromotionSuggestions.propTypes = {
  promotionSuggestion: PropTypes.array,
  textId: PropTypes.string,
  iconName: PropTypes.string,
  onSelect: PropTypes.func,
  mode: PropTypes.string,
  hash: PropTypes.number,
};

PromotionSuggestions.contextTypes = {
  intl: intlShape.isRequired,
};

export default PromotionSuggestions;
