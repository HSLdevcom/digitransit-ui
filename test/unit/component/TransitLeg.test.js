import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import TransitLeg from '../../../app/component/TransitLeg';
import IntermediateLeg from '../../../app/component/IntermediateLeg';

describe('<TransitLeg />', () => {
  it('should show a zone change between from and the first intermediate place', () => {
    const props = {
      children: <div />,
      focusAction: () => {},
      index: 0,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {
            zoneId: 'A',
          },
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showCurrentZoneDelimiter).to.equal(true);
    expect(leg.props().previousZoneId).to.equal('A');
    expect(leg.props().currentZoneId).to.equal('B');
    expect(leg.props().nextZoneId).to.equal(undefined);
  });

  it('should show a zone change between intermediate places', () => {
    const props = {
      children: <div />,
      focusAction: () => {},
      index: 0,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
          {
            arrivalTime: 1540990440000,
            stop: {
              gtfsId: 'HSL:2131251',
              name: 'Nihtisilta',
              code: 'E1313',
              zoneId: 'C',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {},
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const legs = wrapper.find(IntermediateLeg);
    expect(legs).to.have.lengthOf(2);
    expect(legs.at(0).props().showCurrentZoneDelimiter).to.equal(false);
    expect(legs.at(0).props().previousZoneId).to.equal(undefined);
    expect(legs.at(0).props().currentZoneId).to.equal('B');
    expect(legs.at(0).props().nextZoneId).to.equal(undefined);
    expect(legs.at(1).props().showCurrentZoneDelimiter).to.equal(true);
    expect(legs.at(1).props().previousZoneId).to.equal(undefined);
    expect(legs.at(1).props().currentZoneId).to.equal('C');
    expect(legs.at(1).props().nextZoneId).to.equal(undefined);
  });

  it('should show a zone change between the last intermediate place and to', () => {
    const props = {
      children: <div />,
      focusAction: () => {},
      index: 0,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });

    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showCurrentZoneDelimiter).to.equal(false);
    expect(leg.props().previousZoneId).to.equal(undefined);
    expect(leg.props().currentZoneId).to.equal('B');
    expect(leg.props().nextZoneId).to.equal('C');
  });

  it('should not show any zone changes if the feature is disabled', () => {
    const props = {
      children: <div />,
      focusAction: () => {},
      index: 0,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: false,
          },
        },
        focusFunction: () => () => {},
      },
    });
    wrapper.setState({ showIntermediateStops: true });
    const leg = wrapper.find(IntermediateLeg);
    expect(leg.props().showZoneLimits).to.equal(false);
  });

  it('should toggle showIntermediateStops', () => {
    const props = {
      children: <div />,
      focusAction: () => {},
      index: 0,
      leg: {
        from: {
          name: 'Lokkalantie',
          stop: {},
        },
        intermediatePlaces: [
          {
            arrivalTime: 1540990260000,
            stop: {
              code: 'E2502',
              gtfsId: 'HSL:2252202',
              name: 'Leppäsolmu',
              zoneId: 'B',
            },
          },
        ],
        route: {
          gtfsId: 'HSL:7280',
        },
        startTime: 1540989960000,
        to: {
          stop: {
            zoneId: 'C',
          },
        },
        trip: {
          gtfsId: 'HSL:7280_20181022_Ke_1_1435',
          pattern: {
            code: 'HSL:7280:0:01',
          },
        },
      },
      mode: 'BUS',
    };
    const wrapper = shallowWithIntl(<TransitLeg {...props} />, {
      context: {
        config: {
          itinerary: {
            showZoneLimits: true,
          },
        },
        focusFunction: () => () => {},
      },
    });

    wrapper.instance().toggleShowIntermediateStops();
    expect(wrapper.state('showIntermediateStops')).to.equal(true);

    wrapper.instance().toggleShowIntermediateStops();
    expect(wrapper.state('showIntermediateStops')).to.equal(false);
  });
});
