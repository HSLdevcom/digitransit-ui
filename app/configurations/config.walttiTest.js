/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'walttiTest';
const APP_TITLE = 'Waltin testireittiopas';

const ouluConfig = require('./config.oulu').default;

export default configMerger(ouluConfig, {
  CONFIG,

  feedIds: ['WalttiTest'],

  title: APP_TITLE,

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
