import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';
import { configShape } from '../../../util/shapes';
import { getStopMode, transitIconName } from '../../../util/modeUtils';
import { getModeIconColor } from '../../../util/colorUtils';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

function SelectStopRow(
  { code, type, desc, gtfsId, name, terminal, routes, platform },
  { config },
) {
  const mode = getStopMode(type, routes, code, config, terminal);
  const iconOptions = {};
  iconOptions.iconId = transitIconName(
    mode,
    !(terminal || (mode === 'ferry' && !isNull(code))),
  );
  iconOptions.className = mode;
  iconOptions.color = getModeIconColor(config, mode);

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const prefix = terminal ? PREFIX_TERMINALS : PREFIX_STOPS;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${prefix}/${encodeURIComponent(gtfsId)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={iconOptions.className}
          img={iconOptions.iconId}
          color={iconOptions.color || null}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        <div
          className={`choose-row-info-row ${platform ? 'small-margin' : ''}`}
        >
          {(showDesc || showCode) && (
            <span className="choose-row-text">
              {showDesc && <span className="choose-row-address">{desc}</span>}
              {showCode && <span className="choose-row-number">{code}</span>}
            </span>
          )}
        </div>
        <div className="choose-row-info-row small-margin">
          {platform && (
            <span className="choose-row-text">
              <span className="choose-row-platform">
                <FormattedMessage id="platform" defaultMessage="platform" />
              </span>
              <span className="platform-number-wrapper">{platform}</span>
            </span>
          )}
        </div>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  routes: PropTypes.string,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
  platform: PropTypes.string,
};

SelectStopRow.defaultProps = {
  routes: undefined,
  code: undefined,
  desc: undefined,
  terminal: undefined,
  platform: undefined,
};

SelectStopRow.contextTypes = { config: configShape.isRequired };

export default SelectStopRow;
