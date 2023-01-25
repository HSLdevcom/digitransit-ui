import moment from 'moment-timezone/moment-timezone';

// Configure moment with the selected language
// and with the relative time thresholds used when humanizing times
export default function configureMoment(language, config) {
  // EMBARK specific configuration
  // > Note that calling updateLocale also changes the current global locale, to the locale that is updated […].
  // https://momentjs.com/docs/#/customization/
  // This is why we do it here, before switching to the locale identifier by `language`.
  moment.updateLocale('en', {
    longDateFormat: {
      // Use lowercase am/pm meridiem without space (standard is "h:mm A")
      LT: 'h:mma',
    },
  });

  moment.locale(language.toLowerCase());

  if (config.timezoneData) {
    moment.tz.add(config.timezoneData);
    moment.tz.setDefault(config.timezoneData.split('|')[0]);
  }

  if (language !== 'en' && language !== 'en-US') {
    const momentLocale = language.toLowerCase();
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`moment/locale/${momentLocale}`);
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

  // /EMBARK
  return moment;
}
