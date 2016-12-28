import React from 'react';
import sortBy from 'lodash/sortBy';
import { Link } from 'react-router';

import { FakeSearchWithButton } from './FakeSearchWithButtonContainer';
import Icon from './Icon';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';
import IconWithCaution from './IconWithCaution';
import IconWithBigCaution from './IconWithBigCaution';
import ComponentDocumentation from './ComponentDocumentation';
import Departure from './Departure';
import RouteNumber from './RouteNumber';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import Distance from './Distance';
import PlatformNumber from './PlatformNumber';
import CardHeader from './CardHeader';
import Card from './Card';
import CityBikeCard from './CityBikeCard';
import CityBikeContent from './CityBikeContent';
import CityBikeAvailability from './CityBikeAvailability';
import CityBikeUse from './CityBikeUse';
import CityBikePopup from './map/popups/CityBikePopup';
import FavouriteLocation from './FavouriteLocation';
import EmptyFavouriteLocationSlot from './EmptyFavouriteLocationSlot';
import TimeSelectors from './TimeSelectors';
import TimeNavigationButtons from './TimeNavigationButtons';
import RightOffcanvasToggle from './RightOffcanvasToggle';
import TripRouteStop from './TripRouteStop';
import MarkerSelectPopup from './map/tile-layer/MarkerSelectPopup';
import SelectCityBikeRow from './map/tile-layer/SelectCityBikeRow';
import SelectParkAndRideRow from './map/tile-layer/SelectParkAndRideRow';
import SelectStopRow from './map/tile-layer/SelectStopRow';
import SelectTerminalRow from './map/tile-layer/SelectTerminalRow';
import TicketInformation from './TicketInformation';
import RouteScheduleDateSelect from './RouteScheduleDateSelect';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleStopSelect from './RouteScheduleStopSelect';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import RouteStop from './RouteStop';
import RouteAlertsRow from './RouteAlertsRow';
import ModeFilter from './ModeFilter';
import Availability from './Availability';
import ParkAndRideAvailability from './map/popups/ParkAndRideAvailability';
import AppBarSmall from './AppBarSmall';
import AppBarLarge from './AppBarLarge';
import FrontPagePanelSmall from './FrontPagePanelSmall';
import FrontPagePanelLarge from './FrontPagePanelLarge';
import { DepartureRow } from './DepartureRowContainer';
import { BicycleRentalStationRow } from './BicycleRentalStationRowContainer';
import StopPageHeader from './StopPageHeader';
import StopCardHeader from './StopCardHeader';
import SplitBars from './SplitBars';
import Labeled from './Labeled';
import Centered from './Centered';
import InfoIcon from './InfoIcon';
import Favourite from './Favourite';
import DepartureListHeader from './DepartureListHeader';
import NextDeparturesListHeader from './NextDeparturesListHeader';
import CurrentPositionSuggestionItem from './CurrentPositionSuggestionItem';
import SuggestionItem from './SuggestionItem';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import { Component as LangSelect } from './LangSelect';
import ExternalLink from './ExternalLink';
import SummaryRow from './SummaryRow';
import PageFooter from './PageFooter';
import FooterItem from './FooterItem';

const components = {
  Icon,
  IconWithTail,
  SelectedIconWithTail,
  IconWithBigCaution,
  IconWithCaution,
  ComponentDocumentation,
  Departure,
  RouteNumber,
  RouteDestination,
  DepartureTime,
  Distance,
  PlatformNumber,
  CardHeader,
  Card,
  CityBikeCard,
  CityBikeContent,
  CityBikeAvailability,
  CityBikeUse,
  CityBikePopup,
  Availability,
  ParkAndRideAvailability,
  FavouriteLocation,
  EmptyFavouriteLocationSlot,
  TimeSelectors,
  TimeNavigationButtons,
  RightOffcanvasToggle,
  TripRouteStop,
  MarkerSelectPopup,
  SelectCityBikeRow,
  SelectParkAndRideRow,
  SelectStopRow,
  SelectTerminalRow,
  TicketInformation,
  RouteScheduleDateSelect,
  RouteScheduleHeader,
  RouteScheduleStopSelect,
  RouteScheduleTripRow,
  RouteAlertsRow,
  ModeFilter,
  RouteStop,
  DepartureRow,
  BicycleRentalStationRow,
  FakeSearchWithButton,
  AppBarSmall,
  AppBarLarge,
  FrontPagePanelLarge,
  FrontPagePanelSmall,
  StopPageHeader,
  StopCardHeader,
  SplitBars,
  Labeled,
  Centered,
  InfoIcon,
  Favourite,
  DepartureListHeader,
  NextDeparturesListHeader,
  CurrentPositionSuggestionItem,
  SuggestionItem,
  SelectedStopPopupContent,
  SummaryRow,
  ExternalLink,
  LangSelect,
  PageFooter,
  FooterItem,
};

function getColors() {
  return (
    <section>
      <div className="medium-6 column">
        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#007ac9' }} />
        </svg>
        <span className="code color-code">$primary-color</span>#007ac9<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#ffffff' }} />
        </svg>
        <span className="code color-code">$primary-font-color</span>#ffffff<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#0062a1' }} />
        </svg>
        <span className="code color-code">$secondary-color</span>#0062a1<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#ffffff' }} />
        </svg>
        <span className="code color-code">$secondary-font-color</span>#ffffff<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#ffffff' }} />
        </svg>
        <span className="code color-code">$title-color</span>#ffffff<br />
      </div>

      <div className="medium-6 column">
        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#f092cd' }} />
        </svg>
        <span className="code color-code">$favourite-color</span>#f092cd<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#f092cd' }} />
        </svg><span className="code color-code">$hilight-color</span>#f092cd<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#007ac9' }} />
        </svg><span className="code color-code">$action-color</span>#007ac9<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#fed100' }} />
        </svg>
        <span className="code color-code">$disruption-color</span>#fed100<br />

        <svg className="color-palette" width="50" height="50">
          <rect width="50" height="50" style={{ fill: '#4DA2D9' }} />
        </svg>
        <span className="code color-code">$disruption-passive-color</span>#4DA2D9
      </div>

      <p>TODO: dynamically get these colors, now only for HSL</p>

      <img
        src="/img/hsl_reittiopas_map-strokes_02.png"
        alt="Reittiviivat kartalla"
      />
    </section>
  );
}

function getFonts() {
  return (
    <section>
      <p>
        Theme typeface Gotham doesn&apos;t have all symbols in one file,
        so both A and B variants must be specified. Also the weight must
        be specified every time the family is, and vice versa,
        because the weights of one font can be unsuitable for the
        other and therefore shouldn&apos;t be cross inherited when
        the parent element&apos;s font-family is not the same.
      </p>
      <p>
        Easiest way to get all the relevant CSS properties correctly is to include an SCSS helper
        mixin.
      </p>
      <span className="code">$font-family</span>
      <p style={{ fontWeight: '400' }}>
        Primary font: &quot;Gotham Rounded SSm A&quot;,&quot;
        Gotham Rounded SSm B&quot; Arial, Georgia, Serif
        <span className="code">@include font-book</span>
      </p>
      <p style={{ fontWeight: '500' }}>
        Primary font: &quot;Gotham Rounded SSm A&quot;,&quot;
        Gotham Rounded SSm B&quot;, Arial, Georgia, Serif
        <span className="code">@include font-medium</span>
      </p>
      <p style={{ fontWeight: '700' }}>
        Primary font: &quot;Gotham Rounded SSm A&quot;,&quot;
        Gotham Rounded SSm B&quot;, Arial, Georgia, Serif
        <span className="code">@include font-bold</span>
      </p>
      <span className="code">$font-family-narrow</span>
      <p
        style={{
          fontFamily: '"Gotham XNarrow SSm A","Gotham XNarrow SSm B"',
          fontWeight: '400',
        }}
      >
        Secondary font: &quot;Gotham XNarrow SSm A&quot;,
        &quot;Gotham XNarrow SSm B&quot;, Arial, Georgia, Serif
        <span className="code">@include font-narrow-book</span>
      </p>
      <p
        style={{
          fontFamily: '"Gotham XNarrow SSm A","Gotham XNarrow SSm B"',
          fontWeight: '500',
        }}
      >
        Secondary font: &quot;Gotham XNarrow SSm A&quot;,
        &quot;Gotham XNarrow SSm B&quot;, Arial, Georgia, Serif
        <span className="code">@include font-narrow-medium</span>
      </p>
    </section>
  );
}

function getHeadings() {
  return (
    <section>
      <h1>Heading 1<span className="code">{'<h1 />'}</span></h1>
      <h2>Heading 2<span className="code">{'<h2 />'}</span></h2>
      <h3>Heading 3<span className="code">{'<h3 />'}</span></h3>
      <h4>Heading 4<span className="code">{'<h4 />'}</span></h4>
      <h5>Heading 5<span className="code">{'<h5 />'}</span></h5>
      <h6>Heading 6<span className="code">{'<h6 />'}</span></h6>
    </section>
  );
}

function getSubHeaders() {
  return (
    <section>
      <p className="sub-header-h4">
        This is a sub header
        <span className="code">.sub-header-h4</span>
      </p>
    </section>
  );
}

function getTextStyles() {
  return (
    <section>
      <p><a>This is a link</a><span className="code">{'<a />'}</span>
      </p>
      <p>
        <span className="dotted-link cursor-pointer">
          This is a clickable span
        </span>
        <span className="code">
          {'<span className="dotted-link pointer-cursor" />'}
        </span>
      </p>
      <p>Paragraph: normal text looks like this
        <span className="code">
          {'<p />'}
        </span>
      </p>
      <span>span style</span>
      <span className="code">
        <span />
      </span>
      <p className="bold">
        this text is bold (should be avoided, set the complete font with mixins instead)
        <span className="code">.bold or <b />
        </span>
      </p>
    </section>
  );
}

function getIcon(id) {
  return (
    <div key={id}>
      <Icon img={id} />
      <span className="code">{id}</span>
      <br />
    </div>
  );
}

function getIcons() {
  if (typeof document === 'undefined') {
    return null;
  }
  return (
    <section>Import:
      <p className="code">Icon = require &lsquo;../icon/Icon&rsquo;</p>
      <br />
      <div
        style={{
          columnWidth: '20em',
          columnGap: '2em',
          columnCount: 4,
        }}
      >
        {sortBy([].slice.call(document.getElementsByTagName('symbol')), symbol => symbol.id)
          .map(symbol => getIcon(symbol.id),
        )}
      </div>
      <div>
        <Icon className="large-icon" img="icon-icon_subway-live" />
        <span className="code">.large-icon</span>
        <br />
        <Icon className="large-icon" img="icon-icon_user" />
        <span className="code">.large-icon</span>
        <br />
      </div>
    </section>
  );
}

function getHelpers() {
  return (
    <section>
      <div className="bus">some div<span className="code">.bus</span>
      </div>
      <div className="tram">some div<span className="code">.tram</span>
      </div>
      <div className="rail">some div<span className="code">.rail</span>
      </div>
      <div className="subway">some div<span className="code">.subway</span>
      </div>
      <div className="ferry">some div<span className="code">.ferry</span>
      </div>
      <div className="citybike">some div<span className="code">.citybike</span>
      </div>
      <div className="walk">some div<span className="code">.walk</span>
      </div>
      <div className="bicycle">some div<span className="code">.bicycle</span>
      </div>
      <div className="wait">some div<span className="code">.wait</span>
      </div>
      <div className="from">some div<span className="code">.from</span>
      </div>
      <div className="to">some div<span className="code">.to</span>
      </div>
      <br />
      <div className="cursor-pointer">some div<span className="code">.cursor-pointer</span>
      </div>
      <div className="dashed-underline">some div<span className="code">.dashed-underline</span>
      </div>
      <div className="bold">some div<span className="code">.bold</span>
      </div>
      <div className="uppercase">some div<span className="code">.uppercase</span>
      </div>
      <br />
      <div className="padding-small border-dashed">
        the border is not part of the style
        <span className="code">.padding-small</span>
      </div>
      <div className="padding-normal border-dashed">
        some div
        <span className="code">.padding-normal</span>
      </div>
      <div className="padding-vertical-small border-dashed">
        some div
        <span className="code">.padding-vertical-small</span>
      </div>
      <div className="padding-vertical-normal border-dashed">
        some div
        <span className="code">.padding-vertical-normal</span>
      </div>
      <div className="padding-horizontal border-dashed">
        some div
        <span className="code">.padding-horizontal</span>
      </div>
      <div className="no-padding">some div<span className="code">.no-padding</span>
      </div>
      <div className="no-margin">some div<span className="code">.no-margin</span>
      </div>
      <br />
      <div className="left">float left<span className="code">.left</span>
      </div>
      <div className="right">float right<span className="code">.right</span>
      </div>
      <div className="clear">flot is cleared<span className="code">.clear</span>
      </div>
      <div className="text-left">text aligned to left<span className="code">.text-left</span>
      </div>
      <div className="text-right">text aligned to right<span className="code">.text-right</span>
      </div>
      <div className="text-center">text centered aligned<span className="code">.text-center</span>
      </div>
      <div className="inline-block">this div is inlied<span className="code">.inline-block</span>
      </div>
      <div className="inline-block">this also<span className="code">.inline-block</span>
      </div>
    </section>
  );
}

function getComponents() {
  return Object.keys(components).map(component => (
    <div key={component}>
      <ComponentDocumentation component={components[component]} />
    </div>
  ));
}

function StyleGuidePage(props) {
  if (props.params.componentName) {
    return (
      <div className="container column">
        <ComponentDocumentation
          mode="examples-only"
          component={components[props.params.componentName]}
        />
        <hr />
        <Link to="/styleguide">Go back to styleguide</Link>
      </div>);
  }

  return (
    <div className="container column">
      <h1>UI Elements</h1>
      <hr />

      <div className="sub-header">Colors</div>
      {getColors()}<hr />

      <div className="sub-header">Fonts</div>
      {getFonts()}<hr />

      <div className="sub-header">Text Styles</div>
      {getTextStyles()}<hr />

      <div className="sub-header">Headings</div>
      {getHeadings()}<hr />

      <div className="sub-header">Sub Headings</div>
      {getSubHeaders()}<hr />

      <div className="sub-header">Icons</div>
      {getIcons()}<hr />

      <div className="sub-header">Helper Classes</div>
      {getHelpers()}<hr />

      <h1>Components</h1><hr />

      {getComponents()}
    </div>
  );
}

StyleGuidePage.propTypes = {
  params: React.PropTypes.shape({
    componentName: React.PropTypes.string,
  }).isRequired,
};

export default StyleGuidePage;
