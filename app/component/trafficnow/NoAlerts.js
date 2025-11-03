import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { useLogo } from '../../hooks/useLogo';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function NoAlerts() {
  const { notFoundGraphic, colors } = useConfigContext();
  const { logo } = useLogo(notFoundGraphic);
  return (
    <div className="traffic-now__bottom__alerts--empty">
      {logo ? (
        <img src={logo} aria-hidden="true" alt="Not found -graphic" />
      ) : (
        <Icon
          img="icon_three-dots"
          color={colors.primary}
          width={4}
          height={4}
        />
      )}
      <FormattedMessage
        id="disruptions-found-amount"
        values={{ amount: 0 }}
        defaultValue="No disruptions found"
        tagName="h3"
      />
      <FormattedMessage
        id="disruptions-change-filters"
        defaultValue="Please try again with different filters"
        tagName="p"
      />
    </div>
  );
}
