import { onTestFinished } from 'vitest';
import { createPositionService } from '../../../app/data/PositionService';
import { messageActions } from '../../../app/hooks/MessageContext';
import { geolocationMessages } from '../../../utils/client/geolocationMessages';

describe('PositionService', () => {
  it('can be reactivated after disposal', () => {
    const permissionsDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'permissions',
    );
    const query = vi.fn().mockResolvedValue({ state: 'denied' });
    let service;
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: { query },
    });
    onTestFinished(() => {
      service.dispose();
      if (permissionsDescriptor) {
        Object.defineProperty(navigator, 'permissions', permissionsDescriptor);
      } else {
        delete navigator.permissions;
      }
    });

    service = createPositionService(
      { searchParams: {}, URL: {} },
      vi.fn(),
      () => ({ hasLocation: false }),
    );
    service.dispose();
    service.startLocationWatch();
    expect(query).not.toHaveBeenCalled();

    service.activate();
    service.startLocationWatch();
    expect(query).toHaveBeenCalledOnce();
    service.dispose();
  });

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
