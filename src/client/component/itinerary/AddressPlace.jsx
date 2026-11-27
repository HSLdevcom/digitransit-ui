import PropTypes from 'prop-types';

/** Address on the first line and the municipality or other place below it. */
export default function AddressPlace({ address, place, children }) {
  return (
    <div className="address-container">
      <div className="address">
        {address}
        {children}
      </div>
      <div className="place">{place}</div>
    </div>
  );
}

AddressPlace.propTypes = {
  address: PropTypes.string,
  place: PropTypes.string,
  children: PropTypes.node,
};
