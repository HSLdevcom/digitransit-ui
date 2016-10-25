import Store from 'fluxible/addons/BaseStore';

class FeedbackStore extends Store {
  static storeName = 'FeedbackStore';

  modalOpen = false;

  isModalOpen() {
    return this.modalOpen;
  }

  openFeedbackModal() {
    this.modalOpen = true;
    this.emitChange();
  }

  closeFeedbackModal() {
    this.modalOpen = false;
    this.emitChange();
  }

  static handlers = {
    OpenFeedbackModal: 'openFeedbackModal',
    CloseFeedbackModal: 'closeFeedbackModal',
  };
}

export default FeedbackStore;
