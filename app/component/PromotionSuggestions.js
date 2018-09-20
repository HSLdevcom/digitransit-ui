import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';

const PromotionSuggestions = (props, context) => (
  <React.Fragment>
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
            {context.intl.formatMessage(
              { id: 'number-of-minutes' },
              {
                number: Math.round(props.promotionSuggestion.duration / 60),
              },
            )}
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
  promotionSuggestion: PropTypes.object,
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
