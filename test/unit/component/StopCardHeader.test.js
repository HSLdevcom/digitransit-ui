import React from 'react';

import { shallowWithIntl, mountWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import ZoneIcon from '../../../app/component/ZoneIcon';

import Icon from '../../../app/component/Icon';
import StopCardHeader from '../../../app/component/StopCardHeader';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import ExternalLink from '../../../app/component/ExternalLink';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

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
        ...mockContext,
        config: {
          stopCard: {
            header: {
              showZone: true,
            },
          },
          colors: {
            primary: '#000000',
          },
        },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
  });

  it('should not render the virtual monitor if so configured', () => {
    const props = {
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        zoneId: 'A',
      },
      className: 'stop-page header',
    };
    const wrapper = shallowWithIntl(<StopCardHeader {...props} />, {
      context: {
        ...mockContext,
        config: {
          stopCard: {
            header: {
              showZone: false,
              virtualMonitorBaseUrl: '',
            },
          },
          colors: {
            primary: '#000000',
          },
        },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });

    expect(wrapper.find(ExternalLink)).to.have.lengthOf(0);
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
        ...mockContext,
        config: {
          stopCard: {
            header: {
              showZone: false,
            },
          },
          colors: {
            primary: '#000000',
          },
        },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ZoneIcon)).to.have.lengthOf(0);
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
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: {
        ...mockContext,
        config: { stopCard: { header: {} }, colors: { primary: '#000000' } },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).first().prop('img')).to.equal('icon-icon_info');
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
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: {
        ...mockContext,
        config: { stopCard: { header: {} }, colors: { primary: '#000000' } },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).first().prop('img')).to.equal(
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
      context: {
        ...mockContext,
        config: { stopCard: { header: {} }, colors: { primary: '#000000' } },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });

  it('should not use a header icon when the stop has alerts but the alerts are not active', () => {
    const props = {
      currentTime: 500,
      stop: {
        code: '1270',
        desc: 'Hietaniemenkatu',
        gtfsId: 'HSL:1130181',
        name: 'Hietaniemi',
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Info,
            effectiveStartDate: 501,
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: {
        ...mockContext,
        config: { stopCard: { header: {} }, colors: { primary: '#000000' } },
      },
      childContextTypes: {
        ...mockChildContextTypes,
      },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});
