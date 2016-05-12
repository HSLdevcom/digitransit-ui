import React, { Component, PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import BackButton from './back-button';
import DisruptionInfoContainer from '../disruption/DisruptionInfoContainer';
import NotImplemented from '../util/not-implemented';
import OffcanvasMenuContainer from './OffcanvasMenuContainer';

class DefaultNavigation extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    disableBackButton: PropTypes.bool,
    showDisruptionInfo: PropTypes.bool,
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={this.props.className} >
        <NotImplemented />
        <nav className="top-bar">
          {!this.props.disableBackButton ? <BackButton /> : null}
          {this.props.showDisruptionInfo ? <DisruptionInfoContainer /> : null}
          <section className="title">
            <Link to="/">
              <span className="title">{this.props.title}</span>
            </Link>
          </section>
          <OffcanvasMenuContainer />
        </nav>
        <section ref="content" className="content">
          {this.props.children}
        </section>
      </div>);
  }
}

export default DefaultNavigation;
