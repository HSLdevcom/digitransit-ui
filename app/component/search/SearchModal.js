import React from 'react';
import Icon from '../icon/icon';
import Tabs from 'material-ui/Tabs/Tabs';
import config from '../../config';

const SearchModal = (props) => {
  if (!props.modalIsOpen) {
    return false;
  }
  return (
    <div className="search-modal">
      <div className="row fullscreen">
        <div className="small-12 columns cursor-pointer search-header">
          <div className="search-header__back-arrow" onClick={props.closeModal}>
            <Icon img="icon-icon_arrow-left" />
            <span className="search-header-separator" />
          </div>
          <Tabs
            className="search-header__tabs-root"
            inkBarStyle={{
              backgroundColor: config.colors.primary,
              bottom: 'auto',
              top: -43,
            }}
            value={props.selectedTab}
          >
            {props.children}
          </Tabs>
        </div>
      </div>
    </div>);
};

SearchModal.propTypes = {
  modalIsOpen: React.PropTypes.bool.isRequired,
  closeModal: React.PropTypes.func.isRequired,
  selectedTab: React.PropTypes.string.isRequired,
  children: React.PropTypes.node,
};

export default SearchModal;
