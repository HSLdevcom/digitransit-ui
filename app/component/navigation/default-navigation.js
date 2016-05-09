import React from 'react';
import TopNavigation from './top-navigation';
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
  };

  render() {
    return (
      <div
        className={this.props.className}
      >
        <NotImplemented />
        <TopNavigation>
          {!this.props.disableBackButton ? <BackButton /> : null}
          {this.props.showDisruptionInfo ? <DisruptionInfoContainer /> : null}
          <OffcanvasMenuContainer />
        </TopNavigation>
        <section ref="content" className="content">
          {this.props.children}
        </section>
      </div>);
  }
}

export default DefaultNavigation;
