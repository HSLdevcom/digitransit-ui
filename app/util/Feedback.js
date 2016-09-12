import reactCookie from 'react-cookie';
import moment from 'moment';
import config from '../config';
import { getFeedbackStorage, setFeedbackStorage } from '../store/localStorage';


function updateStorage(updates) {
  setFeedbackStorage({ ...getFeedbackStorage(), ...updates });
}

function touch(NOW) {
  updateStorage({ appUseStarted: NOW.valueOf() });
}

function removeCookies(NOW) {
  console.log('removing cookies');
  updateStorage({ feedbackInteractionDate: reactCookie.load('fid') | NOW.valueOf(),
    appUseStarted: NOW.valueOf() });

  ['fid', 'vc'].forEach((name) => {
    reactCookie.remove(name, {
      path: '/',
    });
  });
}

const shouldDisplayPopup = (time) => {
  if (typeof window !== 'undefined' && window !== null && config.feedback.enable) {
    const NOW = moment();
    if (reactCookie.load('vc') !== undefined) {
      // previously data was in cookies, remove cookies TODO remove this at some point
      removeCookies(NOW);
    }


    touch(NOW);

    const appInUseDays = NOW.diff(moment(getFeedbackStorage().appUseStarted), 'days');

    if (appInUseDays > 2) {
      const feedbackInteractionDate = reactCookie.load('fid');

      if (feedbackInteractionDate === undefined || feedbackInteractionDate === null ||
        time - feedbackInteractionDate >= 30 * 24 * 60 * 60 * 1000) {
        return true;
      }
    }
  }
  return false;
};

const recordResult = (piwik, time, nps, preferNew, feedback) => {
  updateStorage({ feedbackInteractionDate: time });

  if (nps !== undefined) {
    piwik.setCustomVariable(1, 'nps', nps, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'nps', nps);
  }

  if (preferNew !== undefined) {
    piwik.setCustomVariable(2, 'prefer_new', preferNew, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'prefer_new', preferNew);
  }

  if (feedback) {
    piwik.setCustomVariable(3, 'feedback', feedback, 'visit');
    piwik.trackEvent('Feedback', 'Set', 'feedback', feedback);
  }

  if (nps !== undefined || preferNew !== undefined || feedback !== undefined) {
    piwik.trackEvent('Feedback', 'Close');
  }
};

export { shouldDisplayPopup, recordResult };
