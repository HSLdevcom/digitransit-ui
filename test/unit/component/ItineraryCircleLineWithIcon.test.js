import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders as render } from '../helpers/mock-providers';

import ItineraryCircleLineWithIcon from '../../../app/component/itinerary/ItineraryCircleLineWithIcon';
import { ViaLocationType, IndoorLegType } from '../../../app/constants';

const defaultProps = {
  index: 1,
  modeClassName: 'wait',
  isNotFirstLeg: true,
};

describe('<ItineraryCircleLineWithIcon />', () => {
  describe('hasPreviousTransitLeg — top circle suppression', () => {
    it('should render top circle when hasPreviousTransitLeg is false', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          hasPreviousTransitLeg={false}
        />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(1);
    });

    it('should suppress top circle when hasPreviousTransitLeg is true', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} hasPreviousTransitLeg />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(0);
    });

    it('should default hasPreviousTransitLeg to false and render top circle', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(1);
    });

    it('should only suppress the top marker, not the bottom — scooter bottom circle still renders', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="scooter"
          hasPreviousTransitLeg
        />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle.top'),
      ).to.have.lengthOf(0);
      expect(
        container.querySelectorAll('.leg-before-circle:not(.top)'),
      ).to.have.lengthOf(1);
    });
  });

  describe('marker types', () => {
    it('should render origin icon for the first leg', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon.from'),
      ).to.have.lengthOf(1);
    });

    it('should not render origin icon when isNotFirstLeg is true even at index 0', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg
        />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon.from'),
      ).to.have.lengthOf(0);
    });

    it('should not render origin icon when index is not 0', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          index={2}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon.from'),
      ).to.have.lengthOf(0);
    });

    it('should render via marker for a via point', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
          isStop={false}
        />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon.via'),
      ).to.have.lengthOf(1);
    });

    it('should not render via marker when isStop is true', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
          isStop
        />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon.via'),
      ).to.have.lengthOf(0);
    });

    it('should render bike park icon when bikePark is true', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} bikePark />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon-container.bike-park'),
      ).to.have.lengthOf(1);
    });

    it('should render car park icon when carPark is true', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} carPark />,
      );
      expect(
        container.querySelectorAll('.itinerary-icon-container.car-park'),
      ).to.have.lengthOf(1);
    });

    it('should render no circle for walk mode', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="walk" />,
      );
      expect(container.querySelectorAll('.leg-before-circle')).to.have.lengthOf(
        0,
      );
    });

    it('should render no circle for bicycle mode', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="bicycle"
        />,
      );
      expect(container.querySelectorAll('.leg-before-circle')).to.have.lengthOf(
        0,
      );
    });

    it('should render bottom circle for scooter mode', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="scooter"
        />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle:not(.top)'),
      ).to.have.lengthOf(1);
    });

    it('should render bottom circle for taxi-external mode', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="taxi-external"
        />,
      );
      expect(
        container.querySelectorAll('.leg-before-circle:not(.top)'),
      ).to.have.lengthOf(1);
    });

    it('should not render bottom circle for wait mode', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="wait" />,
      );
      // bottom circle only rendered for scooter/taxi-external
      expect(
        container.querySelectorAll('.leg-before-circle:not(.top)'),
      ).to.have.lengthOf(0);
    });
  });

  describe('circle color', () => {
    it('should apply color prop as SVG stroke', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} color="#ff0000" />,
      );
      const svg = container.querySelector('.leg-before-circle.top svg');
      expect(svg.style.stroke).to.equal('#ff0000');
    });
  });

  describe('CSS classes', () => {
    it('should apply first-leg class when index is 0 and not isNotFirstLeg', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(container.querySelectorAll('.first-leg')).to.have.lengthOf(1);
    });

    it('should not apply first-leg class when isNotFirstLeg is true', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg
        />,
      );
      expect(container.querySelectorAll('.first-leg')).to.have.lengthOf(0);
    });

    it('should apply via class when viaType is set', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
        />,
      );
      expect(container.querySelectorAll('.via')).to.have.lengthOf.at.least(1);
    });

    it('should apply indoor class when indoorLegType is not NoStepsInside', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="walk"
          indoorLegType={IndoorLegType.AllStepsInside}
        />,
      );
      expect(container.querySelectorAll('.indoor')).to.have.lengthOf(1);
    });
  });

  describe('indoor dotted lines', () => {
    it('should apply default-dotted-line to both lines for walk with no indoor type', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="walk" />,
      );
      expect(
        container.querySelectorAll('.default-dotted-line'),
      ).to.have.lengthOf(2);
    });

    it('should apply indoor-dotted-line to bottom for StepsAfterEntranceInside', () => {
      const { container } = render(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="walk"
          indoorLegType={IndoorLegType.StepsAfterEntranceInside}
        />,
      );
      expect(
        container.querySelectorAll('.indoor-dotted-line'),
      ).to.have.lengthOf(1);
      expect(
        container.querySelectorAll('.default-dotted-line'),
      ).to.have.lengthOf(1);
    });
  });
});
