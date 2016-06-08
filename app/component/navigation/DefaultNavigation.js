import React, { Component, PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import BackButton from './back-button';
import NotImplemented from '../util/not-implemented';
import DisruptionInfo from '../disruption/DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';

// Cannot be stateless, because it contains refs
class DefaultNavigation extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    disableBackButton: PropTypes.bool,
    showDisruptionInfo: PropTypes.bool,
    title: PropTypes.string.isRequired,
    showLogo: PropTypes.bool,
  };

  render() {
    return (
      <div className={this.props.className} >
        <NotImplemented />
        <DisruptionInfo />
        <nav className="top-bar">
          {!this.props.disableBackButton ? <BackButton /> : null}
          <section className="title">
            <Link to="/">
              {this.props.showLogo ?
                <div className="logo" /> :
                <span className="title">{this.props.title}</span>
              }
            </Link>
          </section>
          <MainMenuContainer />
        </nav>
        <section ref="content" className="content">
          {this.props.children}
        </section>
      </div>);
  }
}

export default DefaultNavigation;
