import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import Icon from './Icon';
import Checkbox from './Checkbox';

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

  render() {
    const {
      config,
      location: { params, query },
      intl,
      router,
    } = this.context;
    const { onToggleClick } = this.props;
    const isRegularly = this.isRegularly;

    return (
      <div className="customize-search carpool-offer">
        <button className="close-offcanvas" onClick={onToggleClick}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <Icon img="fg_icon" width={12} height={12} />
        <h2>Ihr Inserat</h2>
        <p>
          Abfahrt: um <br />
          Ankunft: um
        </p>
        <p>Wie oft bieten Sie diese Fahrt an?</p>
        <form onSubmit={this.setFrequency}>
          <div className="radio">
            <label>
              <input
                type="radio"
                id="once"
                value="once"
                name="times"
                defaultChecked
              />
              einmal
            </label>
          </div>
          <div className="radio">
            <label>
              <input
                type="radio"
                id="regularly"
                value="regularly"
                name="times"
              />
              regelmäßig
            </label>
          </div>
          <div>
            <input type="submit" value={isRegularly ? 'Update' : 'Next'} />
          </div>
        </form>
        {isRegularly ? (
          <form>
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
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.tue = !this.days.tue;
                this.forceUpdate();
              }}
              labelId="tuesday"
            />
            <Checkbox
              checked={this.days.wed}
              onChange={e => {
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.wed = !this.days.wed;
                this.forceUpdate();
              }}
              labelId="wednesday"
            />
            <Checkbox
              checked={this.days.thu}
              onChange={e => {
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.thu = !this.days.thu;
                this.forceUpdate();
              }}
              labelId="thursday"
            />
            <Checkbox
              checked={this.days.fri}
              onChange={e => {
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.fri = !this.days.fri;
                this.forceUpdate();
              }}
              labelId="friday"
            />
            <Checkbox
              checked={this.days.sat}
              onChange={e => {
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.sat = !this.days.sat;
                this.forceUpdate();
              }}
              labelId="saturday"
            />
            <Checkbox
              checked={this.days.sun}
              onChange={e => {
                this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
                this.days.sun = !this.days.sun;
                this.forceUpdate();
              }}
              labelId="sunday"
            />
            <div>
              <input type="submit" value="Next" />
            </div>
          </form>
        ) : (
          ''
        )}
      </div>
    );
  }
}
