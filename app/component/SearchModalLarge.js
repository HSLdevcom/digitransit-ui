import PropTypes from 'prop-types';
import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import { intlShape } from 'react-intl';

import Icon from './Icon';

const SearchModal = ({ modalIsOpen, closeModal, selectedTab, children }, { intl, config }) => {
  if (!modalIsOpen) {
    return false;
  }
  return (
    <div>
      <div className="search-modal-overlay" onClick={closeModal} />
      <div className="search-modal-container">
        <div className="search-modal">
          <div className="cursor-pointer search-header">
            <Tabs
              className="search-header__tabs-root"
              inkBarStyle={{
                backgroundColor: config.colors.primary,
                height: '4px',
              }}
              value={selectedTab}
            >{children}</Tabs>
            <div id="close-search-button-container" >
              <button
                onClick={closeModal} title={intl.formatMessage({
                  id: 'close',
                  defaultMessage: 'Close' })}
                className="noborder"
              >
                <Icon img="icon-icon_close" />
              </button>
            </div>
          </div>
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
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default SearchModal;
