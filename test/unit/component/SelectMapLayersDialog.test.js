import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext, mockChildContextTypes } from '../helpers/mock-context';

import { Component as SelectMapLayersDialog } from '../../../app/component/SelectMapLayersDialog';
import BubbleDialog from '../../../app/component/BubbleDialog';

describe('<SelectMapLayersDialog />', () => {
  it('should render', () => {
    const props = {
      config: {
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      },
      mapLayers: {
        stop: {
          bus: false,
        },
        terminal: {},
        ticketSales: {},
      },
      updateMapLayers: () => {},
    };
    const wrapper = mountWithIntl(<SelectMapLayersDialog isOpen {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(BubbleDialog).props().contentClassName).to.equal(
      'select-map-layers-dialog-content',
    );
  });
});
