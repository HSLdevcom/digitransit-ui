import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';

import Icon from './Icon';

const SearchModal = (props, context) => {
  if (!props.modalIsOpen) {
    return false;
  }
  return (
    <div className="search-modal">
      <div className="row fullscreen">
        <div className="small-12 columns cursor-pointer search-header">
          <div
            className="search-header__back-arrow"
            onClick={props.closeModal()}
          >
            <Icon img="icon-icon_arrow-left" />
            <span className="search-header-separator" />
          </div>
          <Tabs
            className="search-header__tabs-root"
            inkBarStyle={{
              backgroundColor: context.config.colors.primary,
              height: 4,
            }}
            value={props.selectedTab}
          >
            {props.children}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

SearchModal.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  selectedTab: PropTypes.string.isRequired,
  children: PropTypes.node,
};

SearchModal.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default SearchModal;
