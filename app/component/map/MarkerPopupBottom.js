import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { withLeaflet } from 'react-leaflet/es/context';
import { dtLocationShape } from '../../util/shapes';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

class MarkerPopupBottom extends React.Component {
  static displayName = 'MarkerPopupBottom';

  static propTypes = {
    location: dtLocationShape.isRequired,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        closePopup: PropTypes.func,
      }),
    }),
    onSelectLocation: PropTypes.func.isRequired,
    reporterUrl: PropTypes.string,
  };

  static defaultProps = {
    reporterUrl: null,
    leaflet: null,
  };

  routeFrom = () => {
    addAnalyticsEvent({
      action: 'EditJourneyStartPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    this.props.onSelectLocation(this.props.location, 'origin');
    this.props.leaflet?.map?.closePopup();
  };

  routeTo = () => {
    addAnalyticsEvent({
      action: 'EditJourneyEndPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    this.props.onSelectLocation(this.props.location, 'destination');
    this.props.leaflet?.map?.closePopup();
  };

  routeAddViaPoint = () => {
    addAnalyticsEvent({
      action: 'AddJourneyViaPoint',
      category: 'ItinerarySettings',
      name: 'MapPopup',
    });
    this.props.onSelectLocation(this.props.location, 'via');
    this.props.leaflet?.map?.closePopup();
  };

  reportDefect = () => {
    if (this.props.reporterUrl) {
      window.open(this.props.reporterUrl);
    }
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    // const reportButton = this.props.reporterUrl ? (
    //   <div onClick={() => this.reportDefect()} className="route cursor-pointer">
    //     <FormattedMessage id="report-defect" defaultMessage="Report defect" />
    //   </div>
    // ) : null;

    return (
      <div className="bottom location">
        <div onClick={() => this.routeFrom()} className="route cursor-pointer">
          <FormattedMessage
            id="route-from-here"
            defaultMessage="Route from here"
          />
        </div>

        {/* TODO: BBNAV-15 */}
        {/* {reportButton} */}

        <div onClick={() => this.routeTo()} className="route cursor-pointer">
          <FormattedMessage id="route-here" defaultMessage="Route here" />
        </div>
      </div>
    );
  }
}

const markerPopupBottomWithLeaflet = withLeaflet(MarkerPopupBottom);

export {
  markerPopupBottomWithLeaflet as default,
  MarkerPopupBottom as Component,
};
