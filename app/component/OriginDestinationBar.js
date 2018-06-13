import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import omit from 'lodash/omit';
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
    initialViaPoints: PropTypes.array,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.object.isRequired,
  };

  state = {
    isViaPoint: this.context.location.query.intermediatePlaces && true,
    viaPointNames: this.props.initialViaPoints,
  };

  setviaPointNames = viapoints => {
    this.setState({
      viaPointNames: viapoints,
    });
  };

  updateViaPoints = newViaPoints => {
    this.context.router.replace({
      ...this.context.location,
      query: {
        ...this.context.location.query,
        intermediatePlaces: newViaPoints,
      },
    });
  };

  swapEndpoints = () => {
    navigateTo({
      base: this.context.location,
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
        query: omit(this.context.location.query, ['intermediatePlaces']),
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
        </div>
      </div>
    );
  }
}
