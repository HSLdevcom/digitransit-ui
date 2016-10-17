import React from 'react';
import Tabs from 'material-ui/Tabs/Tabs';

import Icon from '../icon/icon';
import config from '../../config';


const SearchModal = (props) => {
  if (!props.modalIsOpen) {
    return false;
  }
  return (
    <div className="search-modal-container">
      <div className="search-modal">
        <div className="row float">
          <div className="small-12 columns cursor-pointer search-header">
            <Tabs
              className="search-header__tabs-root"
              inkBarStyle={{
                backgroundColor: config.colors.primary,
                height: '4px',
              }}
              value={props.selectedTab}
            >{props.children}</Tabs>
            <div
              onClick={props.closeModal}
              style={{ position: 'absolute', top: 0, right: '11px', color: '#78909c' }}
            >
              <Icon img="icon-icon_close" />
            </div>
          </div>
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
