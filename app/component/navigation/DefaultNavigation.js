import React, { Component, PropTypes } from 'react';
import BackButton from './BackButton';
import NotImplemented from '../util/not-implemented';
import DisruptionInfo from '../disruption/DisruptionInfo';
import MainMenuContainer from './MainMenuContainer';
import MessageBar from './MessageBar';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

// Cannot be stateless, because it contains refs
class DefaultNavigation extends Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    disableBackButton: PropTypes.bool,
    title: PropTypes.node.isRequired,
    showLogo: PropTypes.bool,
  };

  render() {
    return (
      <div className={`navigation ${this.props.className}`} >
        <NotImplemented />
        <DisruptionInfo />
        <nav className="top-bar">
          {!this.props.disableBackButton ? <BackButton /> : null}
          <section className="title">
            {this.props.showLogo ?
              <div className="logo" /> :
              <span className="title">{this.props.title}</span>
            }
          </section>
          <MainMenuContainer />
        </nav>
        <MessageBar />
        <section ref="content" className="content">
          {this.props.children}
        </section>
      </div>);
  }
}

DefaultNavigation.description = () => (
  <div>
    <p>
      DefaultNavigation
    </p>
    <ComponentUsageExample description="">
      <DefaultNavigation title="Reittiopas.fi" className="fullscreen">Content</DefaultNavigation>
    </ComponentUsageExample>
  </div>);

export default DefaultNavigation;
