import PropTypes from 'prop-types';
import Link from 'found/Link';
import { useIntl } from 'react-intl';
import Icon from '../Icon';
import LegArrowIcon from './LegArrowIcon';

/**
 * Link from a leg to the page of the place where the leg starts or ends.
 * Children are the link content before the via point marker and the arrow.
 * With asAddress the content is wrapped in the address block of the first row.
 * The optional trailing node is placed inside the link, after the arrow.
 */
export default function LegPlaceLink({
  to,
  isViaPoint = false,
  asAddress = false,
  onClick,
  ariaLabel,
  trailing,
  children,
}) {
  const intl = useIntl();
  const content = (
    <>
      {children}
      {isViaPoint && (
        <>
          <Icon img="icon_mapMarker" className="itinerary-mapmarker-icon" />
          <span className="sr-only">{intl.formatMessage({ id: 'via-point' })}</span>
        </>
      )}
      <LegArrowIcon />
    </>
  );
  return (
    <Link
      aria-label={ariaLabel}
      onClick={e => {
        e.stopPropagation();
        onClick?.(e);
      }}
      to={to}
    >
      {asAddress ? <div className="address">{content}</div> : content}
      {trailing}
    </Link>
  );
}

LegPlaceLink.propTypes = {
  to: PropTypes.string.isRequired,
  isViaPoint: PropTypes.bool,
  asAddress: PropTypes.bool,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
  trailing: PropTypes.node,
  children: PropTypes.node,
};
