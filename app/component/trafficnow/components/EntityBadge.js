import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '../../Icon';
import { entityShape } from '../../../util/shapes';

function EntityBadge({
  entity,
  mode,
  ariaLabel,
  className,
  handleClick = () => {},
  isFavourite = false,
  isPattern = false,
  highlighted = false,
}) {
  const { name, url } = entity;

  const link = !isPattern ? (
    <a
      onClick={handleClick(url)}
      href={url}
      className={cx(mode, {
        highlight: highlighted,
      })}
    >
      <span className="routes-m-narrow">{name}</span>
    </a>
  ) : (
    <a onClick={handleClick} href={url} className={mode}>
      <span className="routes-m-narrow">{entity.stops[0].name}</span>
      <Icon img="icon_arrow-right-long" color="currentcolor" />
      <span className="routes-m-narrow">
        {entity.headsign || entity.stops?.at(-1).name}
      </span>
    </a>
  );

  return (
    <div
      aria-label={ariaLabel}
      className={cx(['badge-container', mode, className])}
    >
      <div className="entity-name">{link}</div>
      {isFavourite && <Icon img="icon_my-place" className="fav-icon" />}
    </div>
  );
}

EntityBadge.propTypes = {
  entity: PropTypes.shape(() => entityShape).isRequired,
  mode: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  handleClick: PropTypes.func,
  isFavourite: PropTypes.bool,
  isPattern: PropTypes.bool,
  highlighted: PropTypes.bool,
};

export default EntityBadge;
