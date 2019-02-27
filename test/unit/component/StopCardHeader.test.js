import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import CardHeader from '../../../app/component/CardHeader';
import ZoneIcon from '../../../app/component/ZoneIcon';

import StopCardHeader from '../../../app/component/StopCardHeader';

describe('<StopCardHeader />', () => {
  it('should not render the zone icon if zoneId is missing', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: null,
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: true,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should not render the zone icon if so configured', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: false,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should render the zone icon', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: true,
            },
          },
        },
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(1);
  });

  it('should use the info icon when the stop has alerts and the alert level is info', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(CardHeader).prop('headerIcon').props.img).to.equal(
      'icon-icon_info',
    );
  });

  it('should use the caution icon when the stop has alerts and the alert level is not info', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(CardHeader).prop('headerIcon').props.img).to.equal(
      'icon-icon_caution',
    );
  });

  it('should not use a header icon when the stop has alerts but no severity level', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        alerts: [
          {
            foo: 'bar',
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(CardHeader).prop('headerIcon')).to.not.be.ok; // eslint-disable-line no-unused-expressions
  });
});
