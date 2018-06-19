import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import omit from 'lodash/omit';
import cx from 'classnames';

import DTAutosuggestPanel from './DTAutosuggestPanel';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';
import { PREFIX_ITINERARY_SUMMARY, navigateTo } from '../util/path';
import {
  getIntermediatePlaces,
  setIntermediatePlaces,
} from '../util/queryUtils';
import { dtLocationShape } from '../util/shapes';

export default class OriginDestinationBar extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    origin: dtLocationShape,
    destination: dtLocationShape,
    initialViaPoints: PropTypes.array,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
  };

  state = {
    isViaPoint: this.location.query.intermediatePlaces && true,
    viaPointNames: this.props.initialViaPoints,
  };

  get location() {
    return this.context.router.getCurrentLocation();
  }

  setviaPointNames = viapoints => {
    this.setState({
      viaPointNames: viapoints,
    });
  };

  updateViaPoints = newViaPoints =>
    setIntermediatePlaces(this.context.router, newViaPoints);

  swapEndpoints = () => {
    const { location } = this;
    const intermediatePlaces = getIntermediatePlaces(location.query);
    if (intermediatePlaces.length > 1) {
      location.query.intermediatePlaces.reverse();
      this.setviaPointNames(location.query.intermediatePlaces);
    }

    navigateTo({
      base: location,
      origin: this.props.destination,
      destination: this.props.origin,
      context: PREFIX_ITINERARY_SUMMARY,
      router: this.context.router,
    });
  };

  toggleViaPoint = val => {
    if (val === false) {
      const { location } = this;
      this.context.router.replace({
        ...location,
        query: omit(location.query, ['intermediatePlaces']),
      });
    }
    this.setState({
      isViaPoint: val,
      viaPointNames: !val ? [' '] : this.state.viaPointNames,
    });
  };

  addMoreViapoints = i => {
    const oldViaPoints = this.state.viaPointNames.slice(0);
    oldViaPoints.splice(i + 1, 0, ' ');
    this.setState({
      viaPointNames: oldViaPoints,
    });
  };

  checkAndConvertArray = val =>
    Array.isArray(val) ? val.slice(0) : [val || ' '];

  removeViapoints = index => {
    const viaPointsWithRemoved = this.state.viaPointNames.filter(
      (o, i) => i !== index,
    );

    this.updateViaPoints(viaPointsWithRemoved.filter(o => o !== ' '));

    this.setState({
      viaPointNames: viaPointsWithRemoved,
      isViaPoint: viaPointsWithRemoved.length !== 0,
    });
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
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
          viaPointNames={this.state.viaPointNames}
          setviaPointNames={this.setviaPointNames}
          addMoreViapoints={this.addMoreViapoints}
          removeViapoints={this.removeViapoints}
          updateViaPoints={this.updateViaPoints}
          toggleViaPoint={this.toggleViaPoint}
        />
        <div className="itinerary-search-controls">
          <div
            className="switch"
            onClick={() => this.swapEndpoints()}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && this.swapEndpoints()
            }
            role="button"
            tabIndex="0"
          >
            <span>
              <Icon img="icon-icon_direction-b" />
            </span>
          </div>
          <div
            className="addViaPoint"
            onClick={() => this.toggleViaPoint(true)}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && this.toggleViaPoint(true)
            }
            role="button"
            style={{ display: !this.state.isViaPoint ? 'block' : 'none' }}
            tabIndex="0"
          >
            <span>
              <Icon img="icon-icon_plus" />
            </span>
          </div>
        </div>
      </div>
    );
  }
}
