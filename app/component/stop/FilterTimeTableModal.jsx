import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { CheckboxGroup } from '@hsl-fi/form';
import Icon from '../Icon';
import routeCompare from '../../../utils/client/route-compare';
import {
  getRouteMode,
  modeToTranslationId,
} from '../../../utils/client/modeUtils';
import { stopShape } from '../../../utils/client/shapes';
import { useConfigContext } from '../../client/ConfigContext';

export default function FilterTimeTableModal({
  stop,
  setRoutes,
  showFilterModal,
  showRoutesList,
}) {
  const intl = useIntl();
  const config = useConfigContext();

  const [showRoutes, setShowRoutes] = useState(showRoutesList);
  const [allRoutes, setAllRoutes] = useState(showRoutesList.length === 0);

  const toggleAllRoutes = () => {
    setAllRoutes(true);
    setShowRoutes([]);
  };

  const handleCheckbox = routesToAdd => {
    const chosenRoutes = showRoutes.length > 0 ? showRoutes.slice() : [];

    // concat when handling React state based array to avoid array length being assigned as a value
    const newChosenRoutes =
      chosenRoutes.indexOf(routesToAdd) < 0
        ? chosenRoutes.concat([routesToAdd])
        : chosenRoutes.filter(o => o !== routesToAdd);

    setShowRoutes(newChosenRoutes);
    setAllRoutes(newChosenRoutes.length === 0);
  };

  // Only apply the selection (which updates the URL and can trigger a
  // parent re-render) once the modal is closed, instead of on every
  // checkbox toggle, so the dialog can't get dismissed by its own update.
  const closeModal = () => {
    setRoutes({ showRoutes });
    showFilterModal(false);
  };

  // Find out which departures are ARRIVING to their final stop,
  // not real departures, then remove them
  const routesWithStopTimes = stop.stoptimesForServiceDate
    .map(
      o =>
        o.stoptimes.length > 0 &&
        o.stoptimes[0].pickupType !== 'NONE' && {
          code: o.pattern.code,
          headsign: o.pattern.headsign,
          shortName: o.pattern.route.shortName,
          mode: o.pattern.route.mode,
          type: o.pattern.route.type,
          agency: o.pattern.route.agency.name,
        },
    )
    .filter(o => o)
    .sort(routeCompare)
    // deduplicate patterns with same code
    .filter(
      (pattern, index, self) =>
        self.map(itm => itm.code).indexOf(pattern.code) === index,
    );

  const checkboxItems = [
    {
      name: 'all-routes',
      id: 'input-all-routes',
      checked: allRoutes,
      ariaLabel: intl.formatMessage({
        id: 'select-all-routes',
        defaultMessage: 'Select all routes',
      }),
      title: (
        <span className="route-title">
          <FormattedMessage id="all-routes" defaultMessage="All lines" />
        </span>
      ),
      onChange: toggleAllRoutes,
    },
    ...routesWithStopTimes.map(o => {
      const mode = getRouteMode(o);
      const label = o.shortName || o.agency || '';
      return {
        name: o.code,
        id: `input-${o.code}`,
        checked: showRoutes.includes(o.code),
        ariaLabel: intl.formatMessage(
          {
            id: 'select-route',
            defaultMessage: 'Select {mode} route {shortName} to {headsign}',
          },
          {
            mode: intl.formatMessage({
              id: modeToTranslationId(mode, config),
            }),
            shortName: o.shortName,
            headsign: o.headsign,
          },
        ),
        title: (
          <span className="route-title">
            <Icon className={mode} img={`icon_${mode}`} />
            <span className={`route-label ${mode}`}>{label}</span>
            <span className="route-headsign">{o.headsign}</span>
          </span>
        ),
        onChange: () => handleCheckbox(o.code),
      };
    }),
  ];

  return (
    <Modal lang={config.language} onOpenChange={closeModal} open>
      <ModalContent
        title={intl.formatMessage({ id: 'show-routes' })}
        lang={config.language}
      >
        <div className="routes-container">
          <CheckboxGroup
            label={
              <span className="sr-only">
                {intl.formatMessage({ id: 'show-routes' })}
              </span>
            }
            items={checkboxItems}
          />
        </div>
      </ModalContent>
    </Modal>
  );
}

FilterTimeTableModal.propTypes = {
  stop: stopShape.isRequired,
  setRoutes: PropTypes.func.isRequired,
  showFilterModal: PropTypes.func.isRequired,
  showRoutesList: PropTypes.arrayOf(PropTypes.string).isRequired,
};
