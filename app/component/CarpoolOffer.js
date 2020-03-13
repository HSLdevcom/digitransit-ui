import React from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import Icon from './Icon';

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

  isRegularly = false;

  chooseTimes = e => {
    e.preventDefault();
    this.isRegularly = document.getElementById('regularly').checked;
    this.forceUpdate();
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
        <h2>Ihr Inserat</h2>
        <p>
          Abfahrt: um <br />
          Ankunft: um
        </p>
        <p>Wie oft bieten Sie diese Fahrt an?</p>
        <form onSubmit={this.chooseTimes}>
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
              <input type="radio" id="regularly" value="regularly" name="times" />
              regelmäßig
            </label>
          </div>
          <div>
            <input type="submit" value="Jetzt inserieren" />
          </div>
        </form>
        {isRegularly ? (
          <from>
            <label><input type="checkbox" value="Monday" />Monday</label>
            <label><input type="checkbox" value="Tuesday" />Tuesday</label>
            <label><input type="checkbox" value="Wednesday" />Wednesday</label>
            <label><input type="checkbox" value="Thursday" />Thursday</label>
            <label><input type="checkbox" value="Friday" />Friday</label>
            <label><input type="checkbox" value="Saturday" />Saturday</label>
            <label><input type="checkbox" value="Sunday" />Sunday</label>
            <div>
              <input type="submit" value="Jetzt inserieren" />
            </div>
          </from>
        ) : (
          ''
        )}
      </div>
    );
  }
}
