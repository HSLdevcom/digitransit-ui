import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import StopScheduleStatus from '../../../app/component/stop/StopScheduleStatus';
import {
  STOP_STATUS,
  STOP_STATUS_MESSAGE_IDS,
  DISRUPTION_BADGE_PREFIX,
} from '../../../app/util/stopStatusUtils';

describe('<StopScheduleStatus />', () => {
  it('returns null when status is undefined', () => {
    const wrapper = shallowWithIntl(<StopScheduleStatus />);
    expect(wrapper.type()).to.equal(null);
  });

  it('renders the status message id when status is set and no alertEffects are present', () => {
    const wrapper = shallowWithIntl(
      <StopScheduleStatus status={STOP_STATUS.OUT_OF_SERVICE} />,
    );
    expect(wrapper.find('FormattedMessage').prop('id')).to.equal(
      STOP_STATUS_MESSAGE_IDS[STOP_STATUS.OUT_OF_SERVICE],
    );
  });

  it('renders disruption-badge-* message ids when status is ALERT and alertEffects are present', () => {
    const wrapper = shallowWithIntl(
      <StopScheduleStatus
        status={STOP_STATUS.ALERT}
        alertEffects={['DETOUR']}
      />,
    );
    const messages = wrapper.find('FormattedMessage');
    expect(messages).to.have.lengthOf(1);
    expect(messages.first().prop('id')).to.equal(
      `${DISRUPTION_BADGE_PREFIX}detour`,
    );
  });

  it('renders the status message id (not disruption-badge) when status is ALERT but alertEffects is empty', () => {
    const wrapper = shallowWithIntl(
      <StopScheduleStatus status={STOP_STATUS.ALERT} alertEffects={[]} />,
    );
    expect(wrapper.find('FormattedMessage').prop('id')).to.equal(
      STOP_STATUS_MESSAGE_IDS[STOP_STATUS.ALERT],
    );
  });

  it('renders disruption-badge-* message id when status is INFO and alertEffects are present', () => {
    const wrapper = shallowWithIntl(
      <StopScheduleStatus
        status={STOP_STATUS.INFO}
        alertEffects={['MODIFIED_SERVICE']}
      />,
    );
    expect(wrapper.find('FormattedMessage').prop('id')).to.equal(
      `${DISRUPTION_BADGE_PREFIX}modified_service`,
    );
  });
});
