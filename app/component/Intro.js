import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import bindKeyboard from 'react-swipeable-views/lib/bindKeyboard';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

import config from '../config';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

let slides = {};

if (typeof window !== 'undefined') {
  slides = {
    hsl: require('./IntroHsl').default, // eslint-disable-line global-require
  };
}

const themeSlides = slides[config.CONFIG] || [];

export default class Intro extends React.Component {
  static propTypes = {
    onIntroFinished: React.PropTypes.func.isRequired,
    finalSlide: React.PropTypes.node.isRequired,
  }

  static contextTypes = {
    intl: intlShape.isRequired,
  }

  state = { slideIndex: 0 }

  onNextClick = () => this.handleChange(this.state.slideIndex + 1)

  onTransitionFinished = () =>
    this.state.slideIndex === themeSlides.length && this.props.onIntroFinished()

  handleChange = value => this.setState({ slideIndex: value })

  renderSlide = (content, i) =>
    <div className="intro-slide" key={i} onClick={this.onNextClick}>
      <img src={content.image} role="presentation" />
      <h3>{content.header[this.context.intl.locale]}</h3>
      <span>{content.text[this.context.intl.locale]}</span>
    </div>

  renderDot = (text, i) =>
    <span key={i} className={cx('dot', { active: i === this.state.slideIndex })}>•</span>

  render() {
    return (
      <div className="flex-vertical intro-slides">
        <BindKeyboardSwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
          onTransitionEnd={this.onTransitionFinished}
          className="intro-swipeable"
        >
          {[...(themeSlides.map(this.renderSlide)), this.props.finalSlide]}
        </BindKeyboardSwipeableViews>
        <div className={cx('bottom', { hidden: this.state.slideIndex === themeSlides.length })} >
          {[...themeSlides, this.props.finalSlide].map(this.renderDot)}
          <a className="next" onClick={this.onNextClick} tabIndex="0">
            <FormattedMessage id="next" defaultMessage="next" />
          </a>
        </div>
      </div>
    );
  }
}
