import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import BackButton from './BackButton';

const SelectFromMapHeaderComponent = (props, { config, intl }) => {
  return (
    <React.Fragment>
      <div className="back-button-select-from-map-div">
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          color={config.colors.primary}
          iconClassName="arrow-icon"
          title={
            props.titleId !== undefined
              ? intl.formatMessage({
                  id: props.titleId,
                  defaultMessage: 'Select viaPoint',
                })
              : ''
          }
          titleClassName="back-button-select-from-map-title"
          className="back-button-select-from-map"
          onBackBtnClick={
            props.onBackBtnClick ? props.onBackBtnClick : undefined
          }
        />
      </div>
    </React.Fragment>
  );
};

SelectFromMapHeaderComponent.propTypes = {
  titleId: PropTypes.string,
  onBackBtnClick: PropTypes.func,
};

SelectFromMapHeaderComponent.defaultProps = {
  titleId: undefined,
};

SelectFromMapHeaderComponent.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default SelectFromMapHeaderComponent;
