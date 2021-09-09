/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'engstingen';
const APP_TITLE = 'landstadtmobil Engstingen';

const walttiConfig = require('./config.landstadtmobil.js').default;

export default configMerger(walttiConfig, {
    CONFIG,

    colors: {
        primary: '#FAB900',
    },

    title: APP_TITLE,
    favicon: './app/configurations/images/engstingen/favicon.png',
    logo: 'engstingen/landstadtmobil-logo.svg',

    searchParams: {
        'focus.point.lat': 48.3858,
        'focus.point.lon': 9.3149
    },

    defaultEndpoint: {
        lat: 48.3858,
        lon: 9.3149,
    },
});

