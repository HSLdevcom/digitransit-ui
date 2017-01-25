import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

let slides = {};

if (typeof window !== 'undefined') {
  slides = {
    hsl: require('./IntroHsl').default, // eslint-disable-line global-require
    matka: require('./IntroMatka').default, // eslint-disable-line global-require
  };
}

export default class Intro extends React.Component {
  static propTypes = {
    onIntroFinished: React.PropTypes.func.isRequired,
    finalSlide: React.PropTypes.node.isRequired,
  }

  static contextTypes = {
    intl: intlShape.isRequired,
    config: React.PropTypes.object.isRequired,
  }

  state = { slideIndex: 0 }

  onNextClick = () => this.handleChange(this.state.slideIndex + 1)

  onTransitionFinished = () => {
    const themeSlides = slides[this.context.config.CONFIG] || [];
    return (this.state.slideIndex === themeSlides.length && this.props.onIntroFinished());
  }

  handleChange = value => this.setState({ slideIndex: value })

  renderSlide = (content, i) =>
    <button
      className="intro-slide noborder"
      key={i}
      tabIndex={0}
      onClick={this.onNextClick}
    >
      <img alt="" aria-hidden="true" src={content.image} role="presentation" />
      <h3>{content.header[this.context.intl.locale]}</h3>
      <span>{content.text[this.context.intl.locale]}</span>
    </button>


  renderDot = (text, i) =>
    <span key={i} className={cx('dot', { active: i === this.state.slideIndex })}>•</span>

  render() {
    const themeSlides = slides[this.context.config.CONFIG] || [];
    return (
      <div className="flex-vertical intro-slides">
        <BindKeyboardSwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
          onTransitionEnd={this.onTransitionFinished}
          className="intro-swipeable"
          onScroll={((e) => {
            // If we notice that we tab to the next slide, switch slide and reset scroll position
            if (e.target.scrollLeft !== 0) { this.onNextClick(); }
            // eslint-disable-next-line no-param-reassign
            e.target.scrollLeft = 0;
          })}
        >
          {[...(themeSlides.map(this.renderSlide)), this.props.finalSlide]}
        </BindKeyboardSwipeableViews>
        <div className={cx('bottom', { hidden: this.state.slideIndex === themeSlides.length })} >
          {[...themeSlides, this.props.finalSlide].map(this.renderDot)}
          <button tabIndex={(this.state.slideIndex)}className="next noborder" onClick={this.onNextClick}>
            <FormattedMessage id="next" defaultMessage="next" />
          </button>
        </div>
      </div>
    );
  }
}
