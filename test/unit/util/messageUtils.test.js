import { failedFavouriteMessage } from '../../../app/util/messageUtils';

describe('failedFavouriteMessage', () => {
  it('should generate message content as a flat array', async () => {
    const message = failedFavouriteMessage('route', true);
    expect(Array.isArray(message.content)).toBe(true);
    expect(message.content.length).toBeGreaterThan(0);
  });

  it('should generate different message heading for different types', async () => {
    const routeMessage = failedFavouriteMessage('route', true);
    const stopMessage = failedFavouriteMessage('stop', true);
    expect(routeMessage.content[0].type).toBe('heading');
    expect(stopMessage.content[0].type).toBe('heading');
    expect(routeMessage.content[0].content).not.toBe(
      stopMessage.content[0].content,
    );
  });

  it('should generate different message heading for save and deletion', async () => {
    const saveMessage = failedFavouriteMessage('route', true);
    const deleteMessage = failedFavouriteMessage('route', false);
    expect(saveMessage.content[0].type).toBe('heading');
    expect(deleteMessage.content[0].type).toBe('heading');
    expect(saveMessage.content[0].content).not.toBe(
      deleteMessage.content[0].content,
    );
  });
});
