import React from 'react';
import Link from 'react-router/lib/Link';
import BackButton from './back-button';
import DisruptionInfoContainer from '../disruption/disruption-info-container';
import NotImplemented from '../util/not-implemented';
import OffcanvasMenuContainer from './offcanvas-menu-container';

class DefaultNavigation extends React.Component {
  static propTypes = {
    className: React.PropTypes.string.isRequired,
    children: React.PropTypes.node.isRequired,
    disableBackButton: React.PropTypes.bool,
    showDisruptionInfo: React.PropTypes.bool,
    title: React.PropTypes.string.isRequired,
  };

  render() {
    return (
      <div
        className={this.props.className}
      >
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
