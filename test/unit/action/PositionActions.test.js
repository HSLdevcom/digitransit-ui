import { describe, it, vi } from 'vitest';
import { showGeolocationDeniedMessage } from '../../../app/action/PositionActions';
import { messageActions } from '../../../app/hooks/MessageContext';
import { geolocationMessages } from '../../../utils/client/geolocationMessages';

describe('PositionActions', () => {
  describe('showGeolocationDeniedMessage', () => {
    it('posts the denied message and marks other geolocation messages read via messageActions', () => {
      // Geolocation permission/timeout messages can't be posted through
      // useMessageActions() since PositionActions is a plain Fluxible
      // action module, not a React component/hook. It must go through the
      // messageActions bridge exported by MessageContext instead of the
      // legacy actionContext.dispatch('AddMessage'/'MarkMessageAsRead', ...)
      // calls, which no longer have any listener now that the Flux
      // MessageStore has been replaced by MessageContext.
      const addMessage = vi.spyOn(messageActions, 'addMessage');
      const markMessageAsRead = vi.spyOn(messageActions, 'markMessageAsRead');
      const actionContext = { dispatch: vi.fn() };

      showGeolocationDeniedMessage(actionContext);

      expect(
        addMessage.mock.calls.some(
          call => call[0] === geolocationMessages.denied,
        ),
      ).toBe(true);
      Object.keys(geolocationMessages)
        .filter(id => id !== 'denied')
        .forEach(id => {
          expect(
            markMessageAsRead.mock.calls.some(
              call => call[0] === geolocationMessages[id].id,
            ),
          ).toBe(true);
        });
    });
  });
});
