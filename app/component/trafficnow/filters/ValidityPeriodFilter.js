import React from 'react';

const VALIDITY_PERIOD = {
  ALL: 'ALL',
  VALID: 'VALID',
  UPCOMING: 'UPCOMING',
};

const ValidityPeriodFilter = () => {
  return (
    <>
      <h5>Näytä voimassaolon mukaan</h5>
      <label>
        <input
          type="radio"
          name="myRadio"
          checked
          value={VALIDITY_PERIOD.ALL}
        />
        Kaikki
      </label>
      <label>
        <input type="radio" name="myRadio" value={VALIDITY_PERIOD.VALID} />
        Voimassa
      </label>
      <label>
        <input type="radio" name="myRadio" value={VALIDITY_PERIOD.UPCOMING} />
        Tuleva
      </label>
    </>
  );
};

export default ValidityPeriodFilter;
