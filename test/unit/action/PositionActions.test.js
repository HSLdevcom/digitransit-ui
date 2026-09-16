import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import sinon from 'sinon';
import { showGeolocationDeniedMessage } from '../../../app/action/PositionActions';
import { messageActions } from '../../../app/hooks/MessageContext';
import { geolocationMessages } from '../../../utils/client/geolocationMessages';

describe('PositionActions', () => {
  // A scoped sandbox, not the default sinon.stub()/sinon.restore(): the
  // global sinon sandbox also holds the console.error/Link.render/
  // relay.useFragment stubs set up once in test/unit/helpers/init.js's
  // top-level `before` hook, and calling the bare sinon.restore() here
  // would tear those down for every test file that runs afterwards in the
  // same mocha process.
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('showGeolocationDeniedMessage', () => {
    it('posts the denied message and marks other geolocation messages read via messageActions', () => {
      // Geolocation permission/timeout messages can't be posted through
      // useMessageActions() since PositionActions is a plain Fluxible
      // action module, not a React component/hook. It must go through the
      // messageActions bridge exported by MessageContext instead of the
      // legacy actionContext.dispatch('AddMessage'/'MarkMessageAsRead', ...)
      // calls, which no longer have any listener now that the Flux
      // MessageStore has been replaced by MessageContext.
      const addMessage = sandbox.stub(messageActions, 'addMessage');
      const markMessageAsRead = sandbox.stub(
        messageActions,
        'markMessageAsRead',
      );
      const actionContext = { dispatch: sandbox.spy() };

      showGeolocationDeniedMessage(actionContext);

      expect(addMessage.calledWith(geolocationMessages.denied)).to.equal(true);
      Object.keys(geolocationMessages)
        .filter(id => id !== 'denied')
        .forEach(id => {
          expect(
            markMessageAsRead.calledWith(geolocationMessages[id].id),
          ).to.equal(true);
        });
    });
  });
});
