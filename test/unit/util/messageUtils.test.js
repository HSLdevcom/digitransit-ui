import { expect } from 'chai';
import { describe, it } from 'mocha';
import { failedFavouriteMessage } from '../../../app/util/messageUtils';

describe('failedFavouriteMessage', () => {
  it('should generate message content as a flat array', async () => {
    const message = failedFavouriteMessage('route', true);
    expect(message.content).to.be.an('array').with.length.greaterThan(0);
  });

  it('should generate different message heading for different types', async () => {
    const routeMessage = failedFavouriteMessage('route', true);
    const stopMessage = failedFavouriteMessage('stop', true);
    expect(routeMessage.content[0].type).to.equal('heading');
    expect(stopMessage.content[0].type).to.equal('heading');
    expect(routeMessage.content[0].content).to.not.equal(
      stopMessage.content[0].content,
    );
  });

  it('should generate different message heading for save and deletion', async () => {
    const saveMessage = failedFavouriteMessage('route', true);
    const deleteMessage = failedFavouriteMessage('route', false);
    expect(saveMessage.content[0].type).to.equal('heading');
    expect(deleteMessage.content[0].type).to.equal('heading');
    expect(saveMessage.content[0].content).to.not.equal(
      deleteMessage.content[0].content,
    );
  });
});
