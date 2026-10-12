import { createPositionService } from '../../../app/data/PositionService';
import { messageActions } from '../../../app/hooks/MessageContext';
import { geolocationMessages } from '../../../utils/client/geolocationMessages';

describe('PositionService', () => {
  describe('showGeolocationDeniedMessage', () => {
    it('posts the denied message and marks other geolocation messages read via messageActions', () => {
      // Geolocation messages are posted through the messageActions bridge
      // because this service runs outside React components.
      const addMessage = vi.spyOn(messageActions, 'addMessage');
      const markMessageAsRead = vi.spyOn(messageActions, 'markMessageAsRead');
      const dispatch = vi.fn();
      const service = createPositionService(
        { searchParams: {}, URL: {} },
        dispatch,
        () => ({ hasLocation: false }),
      );
      service.showGeolocationDeniedMessage();
      expect(dispatch).toHaveBeenCalledWith({
        type: 'geolocation-denied',
      });

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
