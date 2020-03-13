import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import Icon from './Icon';
import Checkbox from './Checkbox';
import BubbleDialog from './BubbleDialog';
/** variables in return section:
 *  - time
 *  - from, to
 *  - selected days
 *
 */

export default class CarpoolOffer extends React.Component {
  // duration, from, to, start

  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: PropTypes.shape({
      params: PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
      }),
      query: PropTypes.shape({
        time: PropTypes.number,
      }),
    }),
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
  };

  days = {
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
  };

  isRegularly = false;

  selectedDays = [];

  isFinished = false;

  setFrequency = e => {
    e.preventDefault();
    this.isRegularly = document.getElementById('regularly').checked;
    this.forceUpdate();
  };

  updateSelectedDays = day => {
    if (this.selectedDays.includes(day)) {
      this.selectedDays.splice(this.selectedDays.indexOf(day), 1);
    } else {
      this.selectedDays.push(day);
    }
  };

  finishForm = e => {
    e.preventDefault();
    this.isFinished = true;
    this.forceUpdate();
  };

  getOfferedTimes = () => {
    let tmp = '';
    for (let i = 0; i < this.selectedDays.length; i++) {
      tmp = tmp.concat(this.selectedDays[i]).concat('s, ');
    }
    tmp = tmp
      .replace(/D/g, 'd')
      .replace(/M/g, 'm')
      .replace(/T/g, 't')
      .replace(/F/g, 'f')
      .replace(/S/g, 's')
      .replace(/W/g, 'w');
    tmp = 'Am '.concat(tmp);
    tmp = tmp.replace(/,(?=[^,]*$)/, '');
    const tmp2 = this.props.start;
    tmp = tmp
      .concat(' um ')
      .concat(tmp2)
      .concat(' Uhr.');
    return tmp;
  };

  render() {
    const {
      config,
      location: { params, query },
      intl,
      router,
    } = this.context;
    const { onToggleClick } = this.props;
    const offeredTimes = this.getOfferedTimes();

    return (
      <div className="customize-search carpool-offer">
        <button className="close-offcanvas" onClick={onToggleClick}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <Icon className="fg_icon" img="fg_icon" width={12} height={12} />
        {this.isFinished ? (
          <div className="sidePanelText">
            <h2>Vielen Dank</h2>
            <p>
              Ihr {this.isRegularly ? 'regelmäßiges' : ''} Inserat von{' '}
              {this.props.from} nach {this.props.to} wurde eingestellt.<br />
              Sie haben die folgende Zeit und Tagen inseriert: <br />
              {offeredTimes}
            </p>
            <button
              type="submit"
              className="sidePanel-btn"
              onClick={() => {
                this.isFinished = false;
                this.isRegularly = false;
                this.forceUpdate();
              }}
            >
              Schlißen
            </button>
          </div>
        ) : (
          <div className="sidePanelText">
            <h2>Ihr Inserat</h2>
            <p>
              Abfahrt: {this.props.from} um {this.props.start}<br />
              Ankunft: {this.props.to} um {this.props.start+this.props.duration}
            </p>
            <p>Wie oft bieten Sie diese Fahrt an?</p>
            <form onSubmit={this.setFrequency}>
              <div>
                <input
                  type="radio"
                  id="once"
                  value="once"
                  name="times"
                  defaultChecked
                />
                <label className="radio-label" htmlFor="once">
                  einmal
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="regularly"
                  value="regularly"
                  name="times"
                />
                <label className="radio-label" htmlFor="regularly">
                  regelmäßig
                </label>
              </div>
              <input
                className="sidePanel-btn"
                type="submit"
                value={this.isRegularly ? 'Update' : 'Next'}
              />
            </form>
            {this.isRegularly ? (
              <form onSubmit={this.finishForm}>
                <Checkbox
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.mon = !this.days.mon;
                    this.forceUpdate();
                  }}
                  checked={this.days.mon}
                  labelId="monday"
                  title="mon"
                />
                <Checkbox
                  checked={this.days.tue}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.tue = !this.days.tue;
                    this.forceUpdate();
                  }}
                  labelId="tuesday"
                />
                <Checkbox
                  checked={this.days.wed}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.wed = !this.days.wed;
                    this.forceUpdate();
                  }}
                  labelId="wednesday"
                />
                <Checkbox
                  checked={this.days.thu}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.thu = !this.days.thu;
                    this.forceUpdate();
                  }}
                  labelId="thursday"
                />
                <Checkbox
                  checked={this.days.fri}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.fri = !this.days.fri;
                    this.forceUpdate();
                  }}
                  labelId="friday"
                />
                <Checkbox
                  checked={this.days.sat}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.sat = !this.days.sat;
                    this.forceUpdate();
                  }}
                  labelId="saturday"
                />
                <Checkbox
                  checked={this.days.sun}
                  onChange={e => {
                    this.updateSelectedDays(
                      e.currentTarget.getAttribute('aria-label'),
                    );
                    this.days.sun = !this.days.sun;
                    this.forceUpdate();
                  }}
                  labelId="sunday"
                />
                <div>
                  <input className="sidePanel-btn" type="submit" value="Next" />
                </div>
              </form>
            ) : (
              ''
            )}
          </div>
        )}
      </div>
    );
  }
}
