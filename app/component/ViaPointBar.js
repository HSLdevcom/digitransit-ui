import React from 'react';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import cx from 'classnames';
import without from 'lodash/without';

import ViaPointSearchModal from './ViaPointSearchModal';
import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';


export default class ViaPointBar extends React.Component {
  static propTypes = {
    className: React.PropTypes.string,
  }

  static defaultProps = {
    className: false,
  }

  static contextTypes = {
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  }

  removeViaPoint = () => {
    this.context.router.replace({
      ...this.context.location,
      query: without(this.context.location.query, 'intermediatePlaces'),
    });
  }

  openSearchModal = () =>
  this.context.router.push({
    ...this.context.location,
    state: {
      ...this.context.location.state,
      viaPointSearchModalOpen: 1,
      customizeSearchOffcanvas: true,
    },
  });

  render() {
    return (
      <div>
        <div className={cx('via-point-bar', this.props.className)}>
          { this.context.location.query && this.context.location.query.intermediatePlaces && (
          <div className="via-point">
            <FormattedMessage
              id="via-point"
              defaultMessage="Via point"
              className="via-point-header"
            />
            <button className="noborder link-name" onClick={this.openSearchModal}>
              <span>
                {otpToLocation(this.context.location.query.intermediatePlaces).address}
              </span>
            </button>
            <button className="noborder icon-button" onClick={this.removeViaPoint}>
              <Icon img="icon-icon_close" />
            </button>
          </div>
        )}
        </div>
        <ViaPointSearchModal />
      </div>
    );
  }

}
