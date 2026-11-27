import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { shouldShowFareInfo } from '../../utils/fareUtils';
import { legShape } from '../../utils/shapes';
import ExternalLink from '../ExternalLink';
import { useConfigContext } from '../../hooks/ConfigContext';

export default function LegFareDisclaimer({ leg, mode }) {
  const config = useConfigContext();
  const { locale } = useIntl();
  const isCallAgency = mode === 'call';
  if (leg.fare?.isUnknown && !config.hideUnknownFares && shouldShowFareInfo(config)) {
    const modeDisclaimer = config.modeDisclaimers?.[mode]?.[locale];
    if (modeDisclaimer) {
      return (
        <div className="disclaimer-container unknown-fare-disclaimer__leg description-container">
          {modeDisclaimer.disclaimer}
          <a href={modeDisclaimer.link} target="_blank" rel="noreferrer">
            {modeDisclaimer.text}
          </a>
        </div>
      );
    }

    if (!isCallAgency) {
      return (
        <div className="disclaimer-container unknown-fare-disclaimer__leg">
          <div className="description-container">
            <span className="accent">
              <FormattedMessage id="pay-attention" />
            </span>{' '}
            <FormattedMessage id="separate-ticket-required" />
          </div>
          <div className="ticket-info">
            <div className="accent">{`${leg.from.name} - ${leg.to.name}`}</div>
            {leg.fare.agency && !config.hideExternalOperator(leg.fare.agency) && (
              <>
                {leg.fare.agency.name}
                {leg.fare.agency.fareUrl && (
                  <ExternalLink className="agency-link" href={leg.fare.agency.fareUrl}>
                    <FormattedMessage id="extra-info" />
                  </ExternalLink>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
  }
  return null;
}

LegFareDisclaimer.propTypes = { leg: legShape.isRequired, mode: PropTypes.string.isRequired };
