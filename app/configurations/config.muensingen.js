/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'muensingen';
const APP_TITLE = 'landstadtmobil Münsingen';
const STATIC_MESSAGE_URL =
    process.env.STATIC_MESSAGE_URL ||
    '/assets/messages/message.muensingen.json';

const walttiConfig = require('./config.landstadtmobil.js').default;

export default configMerger(walttiConfig, {
    CONFIG,

    colors: {
        primary: '#bcce17',
    },

    title: APP_TITLE,
    favicon: './app/configurations/images/muensingen/favicon.png',
    logo: 'muensingen/landstadtmobil-muensingen-logo.svg',

    searchParams: {
        'focus.point.lat': 48.4128,
        'focus.point.lon': 9.4947
    },

    defaultEndpoint: {
        lat: 48.4128,
        lon: 9.4947,
    },
});
