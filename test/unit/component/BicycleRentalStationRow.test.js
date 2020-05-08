import React from 'react';

import { BicycleRentalStationRow } from '../../../app/component/BicycleRentalStationRowContainer';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import {
  BIKESTATION_CLOSED,
  BIKESTATION_ON,
  BIKESTATION_OFF,
} from '../../../app/util/citybikes';
import RouteNumber from '../../../app/component/RouteNumber';

describe('<BicycleRentalStationRow />', () => {
  it('should use the normal version of the icon when the station is open', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_ON,
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: true },
        },
      },
    });
    expect(wrapper.find(RouteNumber).prop('icon')).to.not.contain('_off');
  });

  it('should use the "off" version of the icon when the station is closed', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_CLOSED,
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: true },
        },
      },
    });
    expect(wrapper.find(RouteNumber).prop('icon')).to.contain('_off');
  });

  it('should use the "off" version of the icon when the station is off', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_OFF,
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: true },
        },
      },
    });
    expect(wrapper.find(RouteNumber).prop('icon')).to.contain('_off');
  });

  it('should use the icon defined by the citybike network config', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_ON,
        networks: ['foobar'],
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { networks: { foobar: { icon: 'foobaz' } } },
          useSpacesAvailable: true,
        },
      },
    });
    expect(wrapper.find(RouteNumber).prop('icon')).to.equal('icon-icon_foobaz');
  });

  it('should use the "off" version of the icon defined by the citybike network config', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_OFF,
        networks: ['foobar'],
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: {
            networks: { foobar: { icon: 'foobaz' } },
            useSpacesAvailable: true,
          },
        },
      },
    });
    expect(wrapper.find(RouteNumber).prop('icon')).to.equal(
      'icon-icon_foobaz_off',
    );
  });

  it('should show bikesAvailable and spacesAvailable values when useSpacesAvailable is true', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_ON,
        bikesAvailable: 2,
        spacesAvailable: 3,
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: true },
        },
      },
    });
    expect(wrapper.find('.bikes-available').text()).to.equal('2');
    expect(wrapper.find('.bikes-total').text()).to.equal('5');
  });

  it('should show bikesAvailable but no spacesAvailable value when useSpacesAvailable is false', () => {
    const props = {
      distance: 0,
      station: {
        state: BIKESTATION_ON,
        bikesAvailable: 2,
        spacesAvailable: 3,
      },
    };
    const wrapper = shallowWithIntl(<BicycleRentalStationRow {...props} />, {
      context: {
        config: {
          cityBike: { useSpacesAvailable: false },
        },
      },
    });
    expect(wrapper.find('.bikes-available').text()).to.equal('2');
    expect(wrapper.find('.bikes-total')).to.have.lengthOf(0);
  });
});
