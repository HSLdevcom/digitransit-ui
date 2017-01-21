import React from 'react';
import Dialog from 'material-ui/Dialog';

import Icon from './Icon';

export default function Modal(props) {
  return (
    <Dialog
      open={props.open}
      onRequestClose={props.toggleVisibility}
      autoScrollBodyContent
      contentClassName="modal"
    >
      <div className="row">
        <h2 className="left">{props.title}</h2>
        <div className="right text-right modal-top-nav">
          <a
            onClick={props.toggleVisibility}
            className="close-button cursor-pointer"
            tabIndex={0}
          >
            <Icon img="icon-icon_close" />
          </a>
        </div>
      </div>
      <div className="modal-wrapper">
        <div className="modal-content momentum-scroll">
          {props.children}
        </div>
      </div>
    </Dialog>
  );
}

Modal.propTypes = {
  children: React.PropTypes.node,
  open: React.PropTypes.bool,
  title: React.PropTypes.node,
  toggleVisibility: React.PropTypes.func.isRequired,
};

Modal.defaultProps = {
  open: false,
  title: null,
  children: null,
};
