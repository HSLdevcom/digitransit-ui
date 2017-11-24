import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import without from 'lodash/without';
import cx from 'classnames';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import DTAutosuggestPanel from './DTAutosuggestPanel';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';

export default class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape,
    destination: dtLocationShape,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  state = {
    isViaPoint: this.context.location.query.intermediatePlaces && true,
    viaPointName: this.context.location.query.intermediatePlaces
      ? this.context.location.query.intermediatePlaces.split('::')[0]
      : '',
  };

  setViaPointName = name => {
    this.setState({
      viaPointName: name,
    });
  };

  checkViaPointParameters = () => {
    const name = this.context.location.query.intermediatePlaces.split('::')[0];
  };

  swapEndpoints = () => {
    navigateTo({
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
    });
  };

  toggleViaPoint = val => {
    if (val === false) {
      this.context.router.replace({
        ...this.context.location,
        query: without(location.query, 'intermediatePlaces'),
      });
    }
    this.setState({
      isViaPoint: val,
      viaPointName: !val ? '' : this.state.viaPointName,
    });
  };

  render() {
    return (
      <div
        className={cx(
          'origin-destination-bar',
          this.props.className,
          'flex-horizontal',
        )}
      >
        <DTAutosuggestPanel
          origin={this.props.origin}
          destination={this.props.destination}
          isItinerary
          isViaPoint={this.state.isViaPoint}
          viaPointName={this.state.viaPointName}
          setViaPointName={this.setViaPointName}
        />
        <div className="itinerary-search-controls">
          <div className="switch" onClick={() => this.swapEndpoints()}>
            <span>
              <Icon img="icon-icon_direction-b" />
            </span>
          </div>
          <div
            className="addViaPoint"
            style={{ display: !this.state.isViaPoint ? 'block' : 'none' }}
            onClick={() => this.toggleViaPoint(true)}
          >
            <span>
              <Icon img="icon-icon_plus" />
            </span>
          </div>
          <div
            className="removeViaPoint"
            style={{ display: this.state.isViaPoint ? 'block' : 'none' }}
            onClick={() => this.toggleViaPoint(false)}
          >
            <span>
              <Icon img="icon-icon_not-in-use" />
            </span>
          </div>
        </div>
      </div>
    );
  }
}
