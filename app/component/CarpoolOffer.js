import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Moment from 'moment';
import { routerShape } from 'found';
import Icon from './Icon';
import Checkbox from './Checkbox';
import Loading from './Loading';

export default class CarpoolOffer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
    leg: PropTypes.object,
    start: PropTypes.number.isRequired,
  };

  allWeekdays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  allWeekdaysFalse = this.allWeekdays.reduce((accumulator, curr) => {
    accumulator[curr] = false;
    return accumulator;
  }, {});

  constructor(props) {
    super(props);
    this.state = {
      isRegularly: false,
      selectedDays: [],
      days: this.allWeekdaysFalse,
      GDPR: false,
      formState: 'initial',
    };
    this.setRegular = this.setRegular.bind(this);
    this.setOnce = this.setOnce.bind(this);
    this.finishForm = this.finishForm.bind(this);
    this.close = this.close.bind(this);
  }

  setRegular = () => {
    this.setState({ isRegularly: true });
  };

  setOnce = () => {
    this.setState({
      isRegularly: false,
      days: this.allWeekdaysFalse,
    });
  };

  updateSelectedDays = day => {
    if (this.state.selectedDays.includes(day)) {
      this.state.selectedDays.splice(this.state.selectedDays.indexOf(day), 1);
    } else {
      this.state.selectedDays.push(day);
    }
  };

  updatePhoneNumber = event => {
    this.setState({ phoneNumber: event.target.value });
  };

  updateEmail = event => {
    this.setState({ email: event.target.value });
  };

  finishForm = e => {
    e.preventDefault();

    const { from, to } = this.props.leg;

    const carpoolOffer = {
      origin: {
        label: from.name,
        lat: from.lat,
        lon: from.lon,
      },
      destination: {
        label: to.name,
        lat: to.lat,
        lon: to.lon,
      },
      phoneNumber: this.state.phoneNumber,
      email: this.state.email,
      time: {
        type: this.state.isRegularly ? 'recurring' : 'one-off',
        departureTime: new Moment(this.props.start).format('HH:mm'),
      },
      acceptTerms: true,
    };

    if (this.state.isRegularly) {
      carpoolOffer.time.weekdays = this.state.days;
    } else {
      carpoolOffer.time.date = new Moment(this.props.start).format(
        'YYYY-MM-DD',
      );
    }

    this.setState({ formState: 'sending' });
    fetch('/carpool-offers', {
      method: 'POST',
      // eslint-disable-next-line compat/compat
      headers: new Headers({ 'content-type': 'application/json' }),
      body: JSON.stringify(carpoolOffer),
      // eslint-disable-next-line func-names
    }).then(response => {
      if (response.status === 200) {
        this.setState({ formState: 'success' });
      }
      return response.json();
    });
  };

  getOfferedTimes = () => {
    let departureDay = '';
    const departureTime = new Moment(this.props.start).format('LT');
    if (this.state.isRegularly) {
      // If the offer is recurring, return all the selected days as a string.
      departureDay = this.state.selectedDays.join(', ');
      departureDay = departureDay.toLowerCase();
      departureDay =
        departureDay.charAt(0).toUpperCase() + departureDay.slice(1);
    } else {
      // If the offer is one-off, get the date from the epoch time.
      departureDay = new Moment(this.props.start).format('L');
    }
    return { departureDay, departureTime };
  };

  close() {
    this.props.onToggleClick(this.props.leg);
    this.setState({
      formState: 'initial',
      days: this.allWeekdaysFalse,
      isRegularly: false,
      GDPR: false,
    });
  }

  renderCheckbox(weekday, isRegularly) {
    return (
      <div key={weekday}>
        <Checkbox
          disabled={!isRegularly}
          checked={isRegularly && this.state.days[weekday]}
          onChange={e => {
            this.updateSelectedDays(e.currentTarget.getAttribute('aria-label'));
            this.setState(prevState => {
              // eslint-disable-next-line no-param-reassign
              prevState.days[weekday] = !prevState.days[weekday];
              return prevState;
            });
          }}
          labelId={weekday}
        />
      </div>
    );
  }

  renderSuccessMessage() {
    const { from, to } = this.props.leg;
    const origin = from.name;
    const destination = to.name;
    const { departureDay, departureTime } = this.getOfferedTimes();
    const { isRegularly } = this.state;

    return (
      <div className="sidePanelText">
        <h2>
          <FormattedMessage id="thank-you" defaultMessage="Thank you!" />
        </h2>
        <div>
          <p>
            <FormattedMessage
              id="carpool-offer-success"
              values={{ origin, destination }}
              defaultMessage="Your offer from {origin} to {destination} was added."
            />
          </p>
          <p>
            {isRegularly ? (
              <FormattedMessage
                id="chosen-times-recurring"
                defaultMessage="You've set the following times and days: "
              />
            ) : (
              <FormattedMessage
                id="chosen-times-once"
                defaultMessage="You've set the following time: "
              />
            )}
            {departureDay} <FormattedMessage id="at-time" defaultMessage="at" />{' '}
            {departureTime}.
          </p>
          <p>
            <FormattedMessage
              id="carpool-success-info"
              defaultMessage="You will receive an email from ride2go to activate your ad. This email also contains a link with which you can later delete the advertisement."
            />
          </p>
        </div>
        <button type="submit" className="sidePanel-btn" onClick={this.close}>
          <FormattedMessage id="close" defaultMessage="Close" />
        </button>
      </div>
    );
  }

  renderForm() {
    const { from, to } = this.props.leg;
    const origin = from.name;
    const destination = to.name;
    const departure = new Moment(this.props.start).format('LT');
    const { GDPR, isRegularly } = this.state;

    const policyUrl = 'https://fahrgemeinschaft.de/html/datenschutz.html';
    const termsUrl = 'https://ride2go.com/GTC?tenant=fahrgemeinschaft';

    return (
      <form onSubmit={this.finishForm} className="sidePanelText">
        <h2>
          <FormattedMessage id="your-carpool-trip" defaultMessage="Your trip" />
        </h2>
        <p>
          <b>
            <FormattedMessage id="origin" defaultMessage="Origin" />
          </b>
          : {origin} <FormattedMessage id="at-time" defaultMessage="at" />{' '}
          {departure} <FormattedMessage id="time-oclock" defaultMessage=" " />
          <br />
          <b>
            <FormattedMessage id="destination" defaultMessage="Destination" />
          </b>
          : {destination}
        </p>
        <div>
          <FormattedMessage
            id="add-carpool-offer-frequency"
            defaultMessage="How often do you want to add the offer?"
          />
          <div>
            <label className="radio-label" htmlFor="once">
              <input
                onChange={this.setOnce}
                type="radio"
                id="once"
                value="once"
                name="times"
                defaultChecked
              />
              <FormattedMessage id="once" defaultMessage="once" />
            </label>
          </div>
          <div>
            <label className="radio-label" htmlFor="regularly">
              <input
                onChange={this.setRegular}
                type="radio"
                id="regularly"
                value="regularly"
                name="times"
              />
              <FormattedMessage id="recurring" defaultMessage="recurring" />
            </label>
          </div>
        </div>
        <div className="carpool-checkbox">
          {this.allWeekdays.map(day => this.renderCheckbox(day, isRegularly))}
        </div>
        <label className="phone-label" htmlFor="email">
          <FormattedMessage
            id="add-email-address"
            defaultMessage="Add your email address"
          />
          <input
            type="email"
            max="60"
            id="email"
            name="email"
            placeholder="mein.name@mail.de"
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            required
            onChange={this.updateEmail}
          />
          <FormattedMessage
            id="email-info"
            defaultMessage="This will be not be shown to people interested in the ride."
          />
        </label>
        <label className="phone-label" htmlFor="phone">
          <FormattedMessage
            id="add-phone-number"
            defaultMessage="Add your phone number"
          />
          <input
            type="tel"
            max="30"
            id="phone"
            name="phone"
            placeholder="07032 111111"
            pattern="\+?[0-9,\-,(,),/, ]+"
            required
            onChange={this.updatePhoneNumber}
          />
          <br />
          <FormattedMessage
            id="phone-number-info"
            defaultMessage="This will be shown to people interested in the ride."
          />
        </label>
        <div className="gdpr-checkbox">
          <Checkbox
            id="GDPR"
            checked={GDPR}
            onChange={() => {
              this.setState({ GDPR: !GDPR });
            }}
            labelId={
              <FormattedHTMLMessage
                id="accept-carpool-policy"
                values={{ policyUrl, termsUrl }}
                defaultMessage=""
              />
            }
          />
        </div>
        <button disabled={!GDPR} className="standalone-btn" type="submit">
          <FormattedMessage id="offer-ride" defaultMessage="Offer carpool" />
        </button>
      </form>
    );
  }

  renderBody() {
    const { formState } = this.state;
    if (formState === 'initial') {
      return this.renderForm();
    }
    if (formState === 'sending') {
      return <Loading />;
    }
    if (formState === 'success') {
      return this.renderSuccessMessage();
    }
    return null;
  }

  render() {
    const stopPropagation = ev => {
      ev.stopPropagation();
    };

    return (
      // disabled because this thing only prevents events from propagating
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className="customize-search carpool-offer scrollable-content-wrapper momentum-scroll"
        onClick={stopPropagation}
        onKeyPress={stopPropagation}
      >
        <button className="close-offcanvas" onClick={this.close}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <img
          alt="Fahrgemeinschaft.de"
          className="fg_icon"
          src="/img/fahrgemeinschaft-de-rund.png"
        />
        {this.renderBody()}
      </div>
    );
  }
}
