import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import bindKeyboard from 'react-swipeable-views/lib/bindKeyboard';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

let slides = [];

if (typeof window !== 'undefined') {
  /* eslint-disable global-require */
  slides = [
    {
      image: require('../../static/img/hsl-intro-pic.png'),
      header: {
        fi: 'Tervetuloa käyttämään uutta reittiopasta',
        en: 'Tervetuloa käyttämään uutta reittiopasta',
        sv: 'Tervetuloa käyttämään uutta reittiopasta',
      },
      text: {
        fi: 'Nykyinen sijaintisi on avain uusiin ominaisuuksiin. Sallithan paikannuksen!',
        en: 'Nykyinen sijaintisi on avain uusiin ominaisuuksiin. Sallithan paikannuksen!',
        sv: 'Nykyinen sijaintisi on avain uusiin ominaisuuksiin. Sallithan paikannuksen!',
      },
    }, {
      image: require('../../static/img/hsl-origin.png'),
      header: {
        fi: 'Missä oletkin',
        en: 'Missä oletkin',
        sv: 'Missä oletkin',
      },
      text: {
        fi: 'Nykyinen sijaintisi toimii lähtöpaikkana. Saat reitityksen kertomalla määränpään.',
        en: 'Nykyinen sijaintisi toimii lähtöpaikkana. Saat reitityksen kertomalla määränpään.',
        sv: 'Nykyinen sijaintisi toimii lähtöpaikkana. Saat reitityksen kertomalla määränpään.',
      },
    }, {
      image: require('../../static/img/hsl-nearyou.png'),
      header: {
        fi: 'Milloin lähden',
        en: 'Milloin lähden',
        sv: 'Milloin lähden',
      },
      text: {
        fi: 'Tarkista nopeasti, mitä lähtee suraavaksi lähipysäkeiltäsi.',
        en: 'Tarkista nopeasti, mitä lähtee suraavaksi lähipysäkeiltäsi.',
        sv: 'Tarkista nopeasti, mitä lähtee suraavaksi lähipysäkeiltäsi.',
      },
    },
  ];
  /* eslint-enable global-require */
}


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
    this.state.slideIndex === slides.length && this.props.onIntroFinished()

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
          slideStyle={{
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          {[...(slides.map(this.renderSlide)), this.props.finalSlide]}
        </BindKeyboardSwipeableViews>
        <div className={cx('bottom', { hidden: this.state.slideIndex === slides.length })} >
          {[...slides, this.props.finalSlide].map(this.renderDot)}
          <a className="next" onClick={this.onNextClick} tabIndex="0">
            <FormattedMessage id="next" defaultMessage="next" />
          </a>
        </div>
      </div>
    );
  }
}
