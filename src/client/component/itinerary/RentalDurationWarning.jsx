import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function RentalDurationWarning({ network, networkCount, icon }) {
  const config = useConfigContext();

  return (
    <div className="citybike-duration-info-short">
      <Icon img={icon} height={1.2} width={1.2} />
      {networkCount === 1 ? (
        <FormattedMessage
          id="citybike-duration-info-short"
          values={{ duration: config.vehicleRental.networks[network].timeBeforeSurcharge / 60 }}
          defaultMessage=""
        />
      ) : (
        <FormattedMessage id="citybike-duration-general-header" defaultMessage="" />
      )}
    </div>
  );
}

RentalDurationWarning.propTypes = {
  network: PropTypes.string,
  networkCount: PropTypes.number.isRequired,
  icon: PropTypes.string,
};
