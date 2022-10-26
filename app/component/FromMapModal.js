import React from 'react';
import PropTypes from 'prop-types';
import SelectFromMapHeader from './SelectFromMapHeader';

export default class FromMapModal extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func,
    titleId: PropTypes.string,
    favouriteContext: PropTypes.bool,
  };

  static defaultProps = {
    children: [],
    titleId: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      containerClassName: 'from-map-modal-container',
      modalClassName: 'dtmodal display-block windowed',
    };
  }

  handleClose = () => {
    const { modalClassName } = this.state;
    this.setState(
      {
        containerClassName: 'from-map-modal-container closed',
        modalClassName: `${modalClassName} modal-closed`,
      },
      () => setTimeout(() => this.props.onClose(), 500),
    );
  };

  onClickHandle = e => {
    if (e.target.className === 'from-map-modal-container') {
      this.handleClose();
    }
  };

  onKeyDownHandle = e => {
    if (e.keyCode === 27) {
      this.handleClose();
    }
  };

  render() {
    // Override parent style if map is created based on FavouriteModal
    let overrideStyle = {};
    if (this.props.favouriteContext) {
      overrideStyle = { width: '60vw', height: '70vh' };
    }
    return (
      <div
        role="button"
        tabIndex="0"
        className={this.state.containerClassName}
        onClick={this.onClickHandle}
        onKeyDown={this.onKeyDownHandle}
      >
        <div className={this.state.modalClassName}>
          <section className="modal-main" style={overrideStyle}>
            <SelectFromMapHeader
              titleId={this.props.titleId}
              onCloseBtnClick={() => this.handleClose()}
              hideBackBtn
            />
            {this.props.children}
          </section>
        </div>
      </div>
    );
  }
}
