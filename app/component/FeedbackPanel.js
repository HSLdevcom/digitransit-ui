import React from 'react';
import MaterialModal from 'material-ui/Dialog';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';
import ScoreTable from './ScoreTable';
import TextAreaWithCounter from './TextAreaWithCounter';
import { closeFeedbackModal } from '../action/feedbackActions';
import { recordResult } from '../util/Feedback';

const FEEDBACK_OPEN_AREA_MAX_CHARS = 200;

class FeedbackPanel extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    piwik: React.PropTypes.object,
  };

  static propTypes = {
    onClose: React.PropTypes.func,
  }

  static defaultProps= {
    onClose: () => {},
  }

  static isInitialState(state) {
    return (
      state.selectedNPS === undefined &&
      state.useThisMoreLikely === undefined &&
      state.openText === undefined &&
      state.charLeft === FEEDBACK_OPEN_AREA_MAX_CHARS &&
      state.postFirstQuestion === false
    );
  }

  state = {
    postFirstQuestion: false,
    modalIsOpen: false,
    charLeft: FEEDBACK_OPEN_AREA_MAX_CHARS,
  };

  componentDidMount() {
    this.context.getStore('FeedbackStore').addChangeListener(this.onFeedbackModalChange);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !FeedbackPanel.isInitialState(nextState);
  }

  componentWillUnmount() {
    this.context.getStore('FeedbackStore').removeChangeListener(this.onFeedbackModalChange);
  }

  onFeedbackModalChange = () => this.forceUpdate();

  onOpenTextAreaChange = (event) => {
    const input = event.target.value;

    this.setState({
      openText: input,
      charLeft: FEEDBACK_OPEN_AREA_MAX_CHARS - input.length,
    });
  }

  answerFirstQuestion = (answer) => {
    this.setState({
      postFirstQuestion: true,
      selectedNPS: answer,
    });

    recordResult(
      this.context.piwik,
      this.context.getStore('TimeStore').getCurrentTime().valueOf(),
      answer,
    );
  }

  answerSecondQuestion = (answer) => {
    this.setState({
      useThisMoreLikely: answer,
    });
  }

  sendAll = () => {
    recordResult(
      this.context.piwik,
      this.context.getStore('TimeStore').getCurrentTime().valueOf(),
      this.state.selectedNPS,
      this.state.useThisMoreLikely,
      this.state.openText,
    );

    this.closeModal();
  }

  closeModal = () => {
    this.context.executeAction(closeFeedbackModal);

    recordResult(this.context.piwik, this.context.getStore('TimeStore').getCurrentTime().valueOf());

    this.props.onClose();
    return this.setState({
      selectedNPS: undefined,
      useThisMoreLikely: undefined,
      openText: undefined,
      charLeft: FEEDBACK_OPEN_AREA_MAX_CHARS,
      postFirstQuestion: false,
    });
  }

  render() {
    let supplementaryQuestions;
    const isModalOpen = this.context.getStore('FeedbackStore').isModalOpen();

    const lowEndLabel = <FormattedMessage id="very-unlikely" defaultMessage="Very unlikely" />;

    const highEndLabel = <FormattedMessage id="very-likely" defaultMessage="Very likely" />;

    if (this.state.postFirstQuestion) {
      supplementaryQuestions = (
        <div>
          <p className="feedback-question auxiliary-feedback-question">
            <FormattedMessage
              id="likely-to-use"
              defaultMessage="How likely would you use the new service compared to the current reittiopas.fi?"
            />
          </p>
          <ScoreTable
            lowestScore={0}
            highestScore={10}
            handleClick={this.answerSecondQuestion}
            selectedScore={parseInt(this.state.useThisMoreLikely, 10)}
            lowEndLabel={lowEndLabel}
            highEndLabel={highEndLabel}
            showLabels
          />
          <p className="feedback-question--text-area auxiliary-feedback-question inline-block">
            <FormattedMessage
              id="how-to-rate-service"
              defaultMessage="How would you rate the service?"
            />
          </p>
          <TextAreaWithCounter
            showCounter
            maxLength={FEEDBACK_OPEN_AREA_MAX_CHARS}
            charLeft={this.state.charLeft}
            handleChange={this.onOpenTextAreaChange}
            counterClassName="open-feedback-counter-text"
            areaClassName="open-feedback-text-area"
          />
          <div className="send-feedback-button" onClick={this.sendAll}>
            <FormattedMessage id="send" defaultMessage="Send" />
          </div>
        </div>
      );
    }

    return (
      <div>
        <MaterialModal
          className="feedback-modal"
          contentClassName={this.state.postFirstQuestion ?
            'feedback-modal__container--post-first-question' : 'feedback-modal__container'
          }
          bodyClassName={this.state.postFirstQuestion ?
            'feedback-modal__body--post-first-question' : 'feedback-modal__body'
          }
          autoScrollBodyContent
          modal
          overlayStyle={{ background: 'rgba(0, 0, 0, 0.541176)' }}
          open={isModalOpen}
        >
          <div
            className="right cursor-pointer feedback-close-container"
            onClick={this.closeModal}
          >
            <Icon id="feedback-close-icon" img="icon-icon_close" />
          </div>
          <div className="feedback-content-container">
            <p className="feedback-question">
              <FormattedMessage
                id="likely-to-recommend"
                defaultMessage="How likely is it that you would recommend our service to a friend or colleague?"
              />
            </p>
            <ScoreTable
              lowestScore={0}
              highestScore={10}
              handleClick={this.answerFirstQuestion}
              selectedScore={parseInt(this.state.selectedNPS, 10)}
              lowEndLabel={lowEndLabel}
              highEndLabel={highEndLabel}
              showLabels
            />
            {supplementaryQuestions}
          </div>
        </MaterialModal>
      </div>
    );
  }
}

export default FeedbackPanel;
