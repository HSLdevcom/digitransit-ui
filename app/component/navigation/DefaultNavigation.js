import React, { Component, PropTypes } from 'react';
import Tabs from 'material-ui/Tabs/Tabs';
import Tab from 'material-ui/Tabs/Tab';

import getContext from 'recompose/getContext';
import config from '../../config';
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
    breakpoint: PropTypes.string.isRequired,
  };

  static defaultProps = { breakpoint: 'medium' };

  /* medium small template */
  medium = () => (
    <div className={`navigation ${this.props.className}`} >
      <NotImplemented />
      <DisruptionInfo />
      <nav className="top-bar">
        {!this.props.disableBackButton && <BackButton />}
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
    </div>)

  /* large template, static content, logo always visible */
  tabStyle = { height: '60px', textTransform: 'none', fontSize: '17px' };

  large = () => (
    <div className={` ${this.props.className}`} >
      <div className="top-bar row" style={{ maxWidth: '100%' }}>
        <div className="columns small-3" style={{ textAlign: 'left' }}>
          <img alt="LOGO" className="navi-logo" src={config.logo} height="30px" />
        </div>
        <div className="columns small-5">
          <Tabs
            value="a"
            onChange={this.handleChange}
            inkBarStyle={{ height: 4, marginTop: -4 }}
          >
            <Tab label={config.title} value="a" style={{ ...this.tabStyle }} />
            <Tab
              label="HSL" value="b" style={{ ...this.tabStyle }}
              onActive={() => { window.location = 'https://www.hsl.fi/'; }}
            />
          </Tabs>
        </div>
        <div className="columns small-4 hamburger-large">
          <MainMenuContainer />
        </div>
      </div>
      <MessageBar />
      <section ref="content" className="content">
        {this.props.children}
      </section>
    </div>);

  render() {
    return (this.props.breakpoint === 'medium' && this.medium()) || this.large();
  }
}

DefaultNavigation.description = () => (
  <div>
    <p>
      DefaultNavigation accepts breakpoint as prop, default is a wrapper that
      feeds the breakpoint from context as a prop to DefaultNavigation.
    </p>
    <ComponentUsageExample description="">
      <DefaultNavigation title="Reittiopas.fi" className="fullscreen">Content</DefaultNavigation>
    </ComponentUsageExample>
    <ComponentUsageExample description="large">
      <DefaultNavigation breakpoint="large" title="Reittiopas.fi" className="fullscreen">
        Content
      </DefaultNavigation>
    </ComponentUsageExample>
  </div>);

const DefaultNavigationWithBreakpoint =
  getContext({ breakpoint: React.PropTypes.string.isRequired })(DefaultNavigation);

export { DefaultNavigation, DefaultNavigationWithBreakpoint as default };
