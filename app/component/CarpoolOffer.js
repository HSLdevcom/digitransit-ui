import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, FormattedMessage } from 'react-intl';
import Moment from 'moment';
import Icon from './Icon';
import Checkbox from './Checkbox';

export default class CarpoolOffer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
    from: PropTypes.object.isRequired,
    to: PropTypes.object.isRequired,
    start: PropTypes.number.isRequired,
    duration: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      isRegularly: false,
      isFinished: false,
      selectedDays: [],
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    };

    this.setFrequency = this.setFrequency.bind(this);
    this.finishForm = this.finishForm.bind(this);
  }

  setFrequency = e => {
    this.setState({ isRegularly: e.target.checked });
  };

  updateSelectedDays = day => {
    if (this.state.selectedDays.includes(day)) {
      this.state.selectedDays.splice(this.state.selectedDays.indexOf(day), 1);
    } else {
      this.state.selectedDays.push(day);
    }
  };

  finishForm = e => {
    e.preventDefault();
    this.setState({ isFinished: true });

    const carpoolOffer = {
      origin: {
        label: this.props.from.name,
        lat: this.props.from.lat,
        lng: this.props.from.lng,
      },
      destination: {
        label: this.props.to.name,
        lat: this.props.to.lat,
        lng: this.props.to.lng,
      },
      phoneNumber: document.getElementById('phone').value,
      time: {
        type: this.isRegularly ? 'recurring' : 'one-off',
        departureTime: new Moment(this.props.start).format('HH:mm'),
      },
    };

    if (this.isRegularly) {
      carpoolOffer.time.weekdays = this.days;
    } else {
      carpoolOffer.time.date = new Moment(this.props.start).format(
        'YYYY-MM-DD',
      );
    }

    return carpoolOffer;
  };

  getOfferedTimes = () => {
    let departureDay = '';
    const departureTime = new Moment(this.props.start).format('HH:mm');
    if (this.isRegularly) {
      // If the offer is recurring, return all the selected days as a string.
      for (let i = 0; i < this.selectedDays.length; i++) {
        departureDay = departureDay.concat(this.selectedDays[i]).concat('s, ');
      }
      departureDay = departureDay.toLowerCase();
      departureDay =
        departureDay.charAt(0).toUpperCase() + departureDay.slice(1);
      departureDay = departureDay.replace(/,(?=[^,]*$)/, '');
    } else {
      // If the offer is one-off, get the date from the epoch time.
      departureDay = new Moment(this.props.start).format('YYYY-MM-DD');
    }
    return departureDay
      .concat(' ')
      .concat('um') // TODO: translate
      .concat(' ')
      .concat(departureTime)
      .concat('.');
  };

  render() {
    const origin = this.props.from.name;
    const destination = this.props.to.name;
    const departure = new Moment(this.props.start).format('HH:mm');
    const { onToggleClick } = this.props;
    const offeredTimes = this.getOfferedTimes();
    const { isFinished, isRegularly } = this.state;

    return (
      <div className="customize-search carpool-offer">
        <button className="close-offcanvas" onClick={onToggleClick}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <Icon className="fg_icon" img="fg_icon" width={12} height={12} />
        {isFinished ? (
          <div className="sidePanelText">
            <h2>
              <FormattedMessage id="thank-you" defaultMessage="Thank you" />
            </h2>
            <p>
              <FormattedMessage
                id="carpool-offer-success"
                values={{ origin, destination }}
                defaultMessage="Your offer from {origin} to {destination} was added."
              />
              <br />
              {isRegularly ? (
                <FormattedMessage
                  id="chosen-times-recurring"
                  defaultMessage="You've set the following times and days:"
                />
              ) : (
                <FormattedMessage
                  id="chosen-times-once"
                  defaultMessage="You've set the following time:"
                />
              )}
              <br />
              {offeredTimes}
            </p>
            <button
              type="submit"
              className="sidePanel-btn"
              onClick={() => {
                this.setState({ isFinished: false });
                this.setState({ isRegularly: false });
                this.forceUpdate();
              }}
            >
              <FormattedMessage id="close" defaultMessage="Close" />
            </button>
          </div>
        ) : (
          <form onSubmit={this.finishForm} className="sidePanelText">
            <h2>
              <FormattedMessage
                id="your-carpool-trip"
                defaultMessage="Your trip"
              />
            </h2>
            <p>
              <b>
                <FormattedMessage id="origin" defaultMessage="Origin" />
              </b>
              : {origin} <FormattedMessage id="at-time" defaultMessage="at" />{' '}
              {departure}
              <br />
              <b>
                <FormattedMessage
                  id="destination"
                  defaultMessage="Destination"
                />
              </b>
              : {destination}
            </p>
            <p>
              <FormattedMessage
                id="add-carpool-offer-frequency"
                defaultMessage="How often do you want to add the offer?"
              />
            </p>
            <div>
              <input
                onChange={this.setFrequency}
                type="radio"
                id="once"
                value="once"
                name="times"
                defaultChecked
              />
              <label className="radio-label" htmlFor="once">
                <FormattedMessage id="once" defaultMessage="once" />
              </label>
            </div>
            <div>
              <input
                onChange={this.setFrequency}
                type="radio"
                id="regularly"
                value="regularly"
                name="times"
              />
              <label className="radio-label" htmlFor="regularly">
                <FormattedMessage id="recurring" defaultMessage="recurring" />
              </label>
            </div>
            <Checkbox
              disabled={!isRegularly}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.monday = !this.state.days.monday;
                this.forceUpdate();
              }}
              checked={isRegularly && this.state.days.monday}
              labelId="monday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.tuesday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.tuesday = !this.state.days.tuesday;
                this.forceUpdate();
              }}
              labelId="tuesday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.wednesday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.wednesday = !this.state.days.wednesday;
                this.forceUpdate();
              }}
              labelId="wednesday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.thursday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.thursday = !this.state.days.thursday;
                this.forceUpdate();
              }}
              labelId="thursday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.friday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.friday = !this.state.days.friday;
                this.forceUpdate();
              }}
              labelId="friday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.saturday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.saturday = !this.state.days.saturday;
                this.forceUpdate();
              }}
              labelId="saturday"
            />
            <Checkbox
              disabled={!isRegularly}
              checked={isRegularly && this.state.days.sunday}
              onChange={e => {
                this.updateSelectedDays(
                  e.currentTarget.getAttribute('aria-label'),
                );
                this.state.days.sunday = !this.state.days.sunday;
                this.forceUpdate();
              }}
              labelId="sunday"
            />
            <label htmlFor="phone">
              <FormattedMessage
                id="add-phone-number"
                defaultMessage="Add your phone number"
              />
            </label>
            <br />
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="123/456-78901"
              pattern="[0-9]{3}\/[0-9]{3}-[0-9]{5}"
              required
            />
            <br />
            <button className="standalone-btn" type="submit">
              <FormattedMessage
                id="offer-ride"
                defaultMessage="Offer carpool"
              />
            </button>
          </form>
        )}
      </div>
    );
  }
}
