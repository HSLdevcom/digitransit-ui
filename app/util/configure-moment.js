import moment from 'moment-timezone/moment-timezone';
import { Settings } from 'luxon';

// For now also handle luxon configuration inside this function
// Configure moment with the selected language
// and with the relative time thresholds used when humanizing times
export default function configureMoment(language, config) {
  moment.locale(language);
  Settings.defaultLocale = language;

  if (config.timeZone) {
    Settings.defaultZone = config.timeZone;
  }

  if (config.timezoneData) {
    moment.tz.add(config.timezoneData);
    moment.tz.setDefault(config.timezoneData.split('|')[0]);
  }

  if (language !== 'en') {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`moment/locale/${language}`);
    Settings.defaultLocale = language;
  }

  moment.relativeTimeThreshold(
    's',
    config.moment.relativeTimeThreshold.seconds,
  );
  moment.relativeTimeThreshold(
    'm',
    config.moment.relativeTimeThreshold.minutes,
  );
  moment.relativeTimeThreshold('h', config.moment.relativeTimeThreshold.hours);
  moment.relativeTimeThreshold('d', config.moment.relativeTimeThreshold.days);
  moment.relativeTimeThreshold('M', config.moment.relativeTimeThreshold.months);
  return moment;
}
