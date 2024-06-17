/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'walttiTest';
const APP_TITLE = 'Waltin testireittiopas';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const OTP_URL =
  process.env.OTP_URL || `${API_URL}/routing/v2/routers/waltti-alt/`;

const ouluConfig = require('./config.oulu').default;

export default configMerger(ouluConfig, {
  CONFIG,

  feedIds: ['WalttiTest'],

  title: APP_TITLE,

  URL: {
    OTP: OTP_URL,
  },

  staticMessages: [
    {
      id: 'raasepori_msg_20.12.2023',
      priority: -1,
      persistence: 'repeat',
      content: {
        fi: [
          {
            type: 'heading',
            content: 'Käytät Waltin testireittiopasta',
          },
          {
            type: 'text',
            content: '',
          },
        ],
        sv: [
          {
            type: 'heading',
            content: 'Du använder Walttis test reseplanerare',
          },
          {
            type: 'text',
            content: '',
          },
        ],
        en: [
          {
            type: 'heading',
            content: 'You are using Waltti test journey planner',
          },
          {
            type: 'text',
            content: '',
          },
        ],
      },
    },
  ],
});
