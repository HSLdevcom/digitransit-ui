import React from 'react';
import Icon from '../component/icon/icon';
import IconWithTail from '../component/icon/icon-with-tail';
import ComponentDocumentation from '../component/documentation/ComponentDocumentation';
import Departure from '../component/departure/Departure';
import RouteNumber from '../component/departure/RouteNumber';
import RouteDestination from '../component/departure/route-destination';
import DepartureTime from '../component/departure/DepartureTime';
import StopReference from '../component/stop/stop-reference';
import Distance from '../component/departure/distance';
import NotImplemented from '../component/util/not-implemented';
import NotImplementedLink from '../component/util/not-implemented-link';
import CardHeader from '../component/card/card-header';
import Card from '../component/card/card';
import CityBikeCard from '../component/city-bike/city-bike-card';
import CityBikeContent from '../component/city-bike/city-bike-content';
import CityBikeAvailability from '../component/city-bike/city-bike-availability';
import CityBikeUse from '../component/city-bike/city-bike-use';
import CityBikePopup from '../component/map/popups/city-bike-popup';
import FavouriteLocation from '../component/favourites/favourite-location';
import TimeSelectors from '../component/summary/TimeSelectors';
import TimeNavigationButtons from '../component/summary/TimeNavigationButtons';
import MarkerSelectPopup from '../component/map/tile-layer/MarkerSelectPopup';
import SelectCityBikeRow from '../component/map/tile-layer/SelectCityBikeRow';
import SelectStopRow from '../component/map/tile-layer/SelectStopRow';
import sortBy from 'lodash/sortBy';

class StyleGuidelinesPage extends React.Component {
  getColors() {
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

  getFonts() {
    return (
      <section>
        <p>
          Theme typeface Gotham doesn't have all symbols in one file, so both A and B variants must
          be specified. Also the weight must be specified every time the family is, and vice versa,
          because the weights of one font can be unsuitable for the other and therefore shouldn't
          be cross inherited when the parent element's font-family is not the same.
        </p>
        <p>
          Easiest way to get all the relevant CSS properties correctly is to include an SCSS helper
          mixin.
        </p>
        <span className="code">$font-family</span>
        <p style={{ fontWeight: '400' }}>
          Primary font: "Gotham Rounded SSm A","Gotham Rounded SSm B", Arial, Georgia, Serif
          <span className="code">@include font-book</span>
        </p>
        <p style={{ fontWeight: '500' }}>
          Primary font: "Gotham Rounded SSm A","Gotham Rounded SSm B", Arial, Georgia, Serif
          <span className="code">@include font-medium</span>
        </p>
        <p style={{ fontWeight: '700' }}>
          Primary font: "Gotham Rounded SSm A","Gotham Rounded SSm B", Arial, Georgia, Serif
          <span className="code">@include font-bold</span>
        </p>
        <span className="code">$font-family-narrow</span>
        <p
          style={{
            fontFamily: '"Gotham XNarrow SSm A","Gotham XNarrow SSm B"',
            fontWeight: '400',
          }}
        >
          Secondary font: "Gotham XNarrow SSm A","Gotham XNarrow SSm B", Arial, Georgia, Serif
          <span className="code">@include font-narrow-book</span>
        </p>
        <p
          style={{
            fontFamily: '"Gotham XNarrow SSm A","Gotham XNarrow SSm B"',
            fontWeight: '500',
          }}
        >
          Secondary font: "Gotham XNarrow SSm A","Gotham XNarrow SSm B", Arial, Georgia, Serif
          <span className="code">@include font-narrow-medium</span>
        </p>
      </section>
    );
  }

  getHeadings() {
    return (
      <section>
        <h1>Heading 1<span className="code">{"<h1 />"}</span></h1>
        <h2>Heading 2<span className="code">{"<h2 />"}</span></h2>
        <h3>Heading 3<span className="code">{"<h3 />"}</span></h3>
        <h4>Heading 4<span className="code">{"<h4 />"}</span></h4>
        <h5>Heading 5<span className="code">{"<h5 />"}</span></h5>
        <h6>Heading 6<span className="code">{"<h6 />"}</span></h6>
      </section>
    );
  }

  getSubHeaders() {
    return (
      <section>
        <p className="sub-header-h4">
          This is a sub header
          <span className="code">.sub-header-h4</span>
        </p>
      </section>
    );
  }

  getTextStyles() {
    return (
      <section>
        <p><a href="#">This is a link</a><span className="code">{"<a />"}</span>
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
            {"<p />"}
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

  getIcon(id) {
    return (
      <div key={id}>
        <Icon img={id} />
        <span className="code">{id}</span>
        <br />
      </div>
    );
  }

  getIcons() {
    return (
      <section>Import:
        <p className="code">Icon = require '../icon/icon'</p>
        <br />
        <div
          style={{
            columnWidth: '20em',
            columnGap: '2em',
            columnCount: 4,
          }}
        >
          {sortBy([].slice.call(document.getElementsByTagName('symbol')), symbol => symbol.id)
            .map(symbol => this.getIcon(symbol.id)
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

  getHelpers() {
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

  getDepartureMolecules() {
    return (
      <div>
        <ComponentDocumentation component={Departure} />
        <ComponentDocumentation component={DepartureTime} />
        <ComponentDocumentation component={RouteNumber} />
        <ComponentDocumentation component={RouteDestination} />
        <ComponentDocumentation component={StopReference} />
        <ComponentDocumentation component={Distance} />
        <ComponentDocumentation component={NotImplementedLink} />
        <ComponentDocumentation component={NotImplemented} />
      </div>
    );
  }

  getCardComponents() {
    return (
      <div>
        <ComponentDocumentation component={CardHeader} />
        <ComponentDocumentation component={Card} />
        <ComponentDocumentation component={CityBikeCard} />
        <ComponentDocumentation component={CityBikeContent} />
        <ComponentDocumentation component={CityBikeAvailability} />
        <ComponentDocumentation component={CityBikeUse} />
        <ComponentDocumentation component={CityBikePopup} />
        <ComponentDocumentation component={FavouriteLocation} />
      </div>
    );
  }

  getIconComponents() {
    return <div><ComponentDocumentation component={IconWithTail} /></div>;
  }

  getSummaryComponents() {
    return (
      <div>
        <ComponentDocumentation component={TimeNavigationButtons} />
        <ComponentDocumentation component={TimeSelectors} />
      </div>
    );
  }

  getTileLayerComponents() {
    return (
      <div>
        <ComponentDocumentation component={MarkerSelectPopup} />
        <ComponentDocumentation component={SelectCityBikeRow} />
        <ComponentDocumentation component={SelectStopRow} />
      </div>
    );
  }

  render() {
    return (
      <div className="container column">
        <h1>UI Elements</h1>
        <hr />

        <div className="sub-header">Colors</div>
        {this.getColors()}<hr />

        <div className="sub-header">Fonts</div>
        {this.getFonts()}<hr />
        <div className="sub-header">Text Styles</div>
        {this.getTextStyles()}<hr />

        <div className="sub-header">Headings</div>
        {this.getHeadings()}<hr />

        <div className="sub-header">Sub Headings</div>
        {this.getSubHeaders()}<hr />

        <div className="sub-header">Icons</div>
        {this.getIcons()}<hr />

        <div className="sub-header">Helper Classes</div>
        {this.getHelpers()}<hr />

        <h1>Components</h1><hr />

        {this.getDepartureMolecules()}
        {this.getCardComponents()}
        {this.getIconComponents()}
        {this.getSummaryComponents()}
        {this.getTileLayerComponents()}
      </div>
    );
  }
}

export default StyleGuidelinesPage;
