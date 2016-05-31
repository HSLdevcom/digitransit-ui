import config from '../config';

import moment from 'moment-timezone';

// Configure moment with the selected language
// and with the relative time thresholds used when humanizing times
function configureMoment(language) {
  moment.locale(language);

  if (config.timezone) {
    moment.tz.setDefault(config.timezone);
  }

  if (language !== 'en') {
    require(`moment/locale/${language}`); // eslint-disable-line global-require
  }

  moment.relativeTimeThreshold('s', config.moment.relativeTimeThreshold.seconds);
  moment.relativeTimeThreshold('m', config.moment.relativeTimeThreshold.minutes);
  moment.relativeTimeThreshold('h', config.moment.relativeTimeThreshold.hours);
  moment.relativeTimeThreshold('d', config.moment.relativeTimeThreshold.days);
  moment.relativeTimeThreshold('M', config.moment.relativeTimeThreshold.months);
  return moment;
}

module.exports = configureMoment;
