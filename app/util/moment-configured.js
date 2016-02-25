var config = require('../config')

var moment = require('moment');

//TODO: use two letter locale string (nb, fi etc) from the selected locale
require('moment/locale/nb');
moment.locale(config.moment.locale);

moment.relativeTimeThreshold('s', config.moment.relativeTimeThreshold.seconds);
moment.relativeTimeThreshold('m', config.moment.relativeTimeThreshold.minutes);
moment.relativeTimeThreshold('h', config.moment.relativeTimeThreshold.hours);
moment.relativeTimeThreshold('d', config.moment.relativeTimeThreshold.days);
moment.relativeTimeThreshold('M', config.moment.relativeTimeThreshold.months);

module.exports = moment;
