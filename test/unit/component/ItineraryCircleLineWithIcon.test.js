import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';

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
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          hasPreviousTransitLeg={false}
        />,
      );
      expect(wrapper.find('.leg-before-circle.top')).to.have.lengthOf(1);
    });

    it('should suppress top circle when hasPreviousTransitLeg is true', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} hasPreviousTransitLeg />,
      );
      expect(wrapper.find('.leg-before-circle.top')).to.have.lengthOf(0);
    });

    it('should default hasPreviousTransitLeg to false and render top circle', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} />,
      );
      expect(wrapper.find('.leg-before-circle.top')).to.have.lengthOf(1);
    });

    it('should only suppress the top marker, not the bottom — scooter bottom circle still renders', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="scooter"
          hasPreviousTransitLeg
        />,
      );
      expect(wrapper.find('.leg-before-circle.top')).to.have.lengthOf(0);
      expect(wrapper.find('.leg-before-circle:not(.top)')).to.have.lengthOf(1);
    });
  });

  describe('marker types', () => {
    it('should render origin icon for the first leg', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(wrapper.find('.itinerary-icon.from')).to.have.lengthOf(1);
    });

    it('should not render origin icon when isNotFirstLeg is true even at index 0', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg
        />,
      );
      expect(wrapper.find('.itinerary-icon.from')).to.have.lengthOf(0);
    });

    it('should not render origin icon when index is not 0', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          index={2}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(wrapper.find('.itinerary-icon.from')).to.have.lengthOf(0);
    });

    it('should render via marker for a via point', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
          isStop={false}
        />,
      );
      expect(wrapper.find('.itinerary-icon.via')).to.have.lengthOf(1);
    });

    it('should not render via marker when isStop is true', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
          isStop
        />,
      );
      expect(wrapper.find('.itinerary-icon.via')).to.have.lengthOf(0);
    });

    it('should render bike park icon when bikePark is true', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} bikePark />,
      );
      expect(
        wrapper.find('.itinerary-icon-container.bike-park'),
      ).to.have.lengthOf(1);
    });

    it('should render car park icon when carPark is true', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} carPark />,
      );
      expect(
        wrapper.find('.itinerary-icon-container.car-park'),
      ).to.have.lengthOf(1);
    });

    it('should render no circle for walk mode', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="walk" />,
      );
      expect(wrapper.find('.leg-before-circle')).to.have.lengthOf(0);
    });

    it('should render no circle for bicycle mode', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="bicycle"
        />,
      );
      expect(wrapper.find('.leg-before-circle')).to.have.lengthOf(0);
    });

    it('should render bottom circle for scooter mode', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="scooter"
        />,
      );
      expect(wrapper.find('.leg-before-circle:not(.top)')).to.have.lengthOf(1);
    });

    it('should render bottom circle for taxi-external mode', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="taxi-external"
        />,
      );
      expect(wrapper.find('.leg-before-circle:not(.top)')).to.have.lengthOf(1);
    });

    it('should not render bottom circle for wait mode', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="wait" />,
      );
      // bottom circle only rendered for scooter/taxi-external
      expect(wrapper.find('.leg-before-circle:not(.top)')).to.have.lengthOf(0);
    });
  });

  describe('circle color', () => {
    it('should apply color prop as SVG stroke', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} color="#ff0000" />,
      );
      const svg = wrapper.find('.leg-before-circle.top svg');
      expect(svg.prop('style')).to.deep.include({ stroke: '#ff0000' });
    });
  });

  describe('CSS classes', () => {
    it('should apply first-leg class when index is 0 and not isNotFirstLeg', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg={false}
        />,
      );
      expect(wrapper.find('.first-leg')).to.have.lengthOf(1);
    });

    it('should not apply first-leg class when isNotFirstLeg is true', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          index={0}
          modeClassName="wait"
          isNotFirstLeg
        />,
      );
      expect(wrapper.find('.first-leg')).to.have.lengthOf(0);
    });

    it('should apply via class when viaType is set', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          viaType={ViaLocationType.Visit}
        />,
      );
      expect(wrapper.find('.via')).to.have.lengthOf.at.least(1);
    });

    it('should apply indoor class when indoorLegType is not NoStepsInside', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="walk"
          indoorLegType={IndoorLegType.AllStepsInside}
        />,
      );
      expect(wrapper.find('.indoor')).to.have.lengthOf(1);
    });
  });

  describe('indoor dotted lines', () => {
    it('should apply default-dotted-line to both lines for walk with no indoor type', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon {...defaultProps} modeClassName="walk" />,
      );
      expect(wrapper.find('.default-dotted-line')).to.have.lengthOf(2);
    });

    it('should apply indoor-dotted-line to bottom for StepsAfterEntranceInside', () => {
      const wrapper = shallow(
        <ItineraryCircleLineWithIcon
          {...defaultProps}
          modeClassName="walk"
          indoorLegType={IndoorLegType.StepsAfterEntranceInside}
        />,
      );
      expect(wrapper.find('.indoor-dotted-line')).to.have.lengthOf(1);
      expect(wrapper.find('.default-dotted-line')).to.have.lengthOf(1);
    });
  });
});
