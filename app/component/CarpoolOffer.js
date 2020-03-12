import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';
import PropTypes from 'prop-types';

/** variables in return section:
 *  - time
 *  - from, to
 *  - selected days
 *
 */

export default function CarpoolOffer(duration, from, to, start) {
  return (
    <div className="carpool-offer">
      <h2>Ihr Inserat</h2>
      <p>
        Abfahrt: {from} um {start} <br />
        Ankunft: {to} um {start + duration}
      </p>
      <p>Wie oft bieten Sie diese Fahrt an?</p>
      <form>
        <div className="radio">
          <label>
            <input type="radio" value="regularly" name="times" />
            regelmäßig
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="once" name="times" checked />
            einmal
          </label>
        </div>
        <div>
          <input type="submit" value="Jetzt inserieren" />
        </div>
      </form>
    </div>
  );
}
