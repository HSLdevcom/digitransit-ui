import React from 'react';

import { shallowWithIntl, mountWithIntl } from '../helpers/mock-intl-enzyme';
import { AlertSeverityLevelType } from '../../../app/constants';
import ZoneIcon from '../../../app/component/ZoneIcon';

import Icon from '../../../app/component/Icon';
import StopCardHeader from '../../../app/component/StopCardHeader';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import ExternalLink from '../../../app/component/ExternalLink';

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
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: false,
              virtualMonitorBaseUrl: '',
            },
          },
        },
      },
    });

    expect(wrapper.find(ExternalLink)).to.have.lengthOf(0);
  });

  it('should render the virtual monitor link for non-popups if gtfsId and virtualMonitorBaseUrl are defined', () => {
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
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: {
        config: {
          stopCard: {
            header: {
              showZone: false,
              virtualMonitorBaseUrl: 'http://foo.com/virtualmonitor/',
            },
          },
        },
      },
    });

    expect(wrapper.find(ExternalLink)).to.have.lengthOf(1);
    expect(wrapper.find(ExternalLink).prop('href')).to.equal(
      'http://foo.com/virtualmonitor/HSL:1130181',
    );
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
    const wrapper = mountWithIntl(<StopCardHeader {...props} />, {
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_info');
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
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(false);
    expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_caution');
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
      context: { config: { stopCard: { header: {} } } },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});
