import PropTypes from 'prop-types';
import { useId, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { Icon, ArrowDownS, ArrowUpS } from '@hsl-fi/icons';
import AddressRow from '../AddressRow';
import ZoneIcon from '../ZoneIcon';
import { getZoneLabel } from '../../utils/legUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import styles from './SkippedStops.module.scss';

/** Collapsible group of stops that the trip skips due to a real-time modification. */
export default function SkippedStops({ stops, color, stopPassed = false }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const config = useConfigContext();

  return (
    <div className={styles.container}>
      <div className={styles.line} aria-hidden="true">
        <div
          className={cx(styles['line-bar'], { [styles.passed]: stopPassed })}
          style={{ backgroundColor: !stopPassed ? color : null }}
        />
      </div>
      <fieldset className={cx(styles.box, { [styles.open]: open })}>
        <legend className={cx(styles.legend, { 'sr-only': open })}>
          <span className={styles.count} aria-hidden="true">
            {stops.length}
          </span>
          <FormattedMessage id="skipped-stops" values={{ count: stops.length }} />
        </legend>
        {open && (
          <ul id={listId} className={styles.list}>
            {stops.map((stop, i) => (
              // loop routes list the same stop twice, so we need a unique key for each occurrence.
              // eslint-disable-next-line react/no-array-index-key
              <li key={`${stop.gtfsId}-${i}`} className={styles.stop}>
                <svg
                  className={styles.cross}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="10" fill="white" />
                  <circle cx="8" cy="8" r="8" />
                  <path
                    d="M5.5 5.5l5 5m0-5l-5 5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <div className={styles.name}>{stop.name}</div>
                  <div className={styles.address}>
                    <AddressRow desc={stop.desc} code={stop.code} />
                    {config.zones.stops && stop.zoneId && (
                      <ZoneIcon
                        className="itinerary-zone-icon"
                        zoneId={getZoneLabel(stop.zoneId, config)}
                        showUnknown={false}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => setOpen(!open)}
        >
          <Icon icon={open ? ArrowUpS : ArrowDownS} size="s" color="accent" />
          <FormattedMessage id={open ? 'skipped-stops-hide' : 'skipped-stops-show'} />
        </button>
      </fieldset>
    </div>
  );
}

SkippedStops.propTypes = {
  stops: PropTypes.arrayOf(
    PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      name: PropTypes.string,
      desc: PropTypes.string,
      code: PropTypes.string,
      zoneId: PropTypes.string,
    }),
  ).isRequired,
  color: PropTypes.string,
  stopPassed: PropTypes.bool,
};
