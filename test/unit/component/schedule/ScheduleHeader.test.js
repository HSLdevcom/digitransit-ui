import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import ScheduleHeader from '../../../../app/component/routepage/schedule/ScheduleHeader';
import ScheduleDropdown from '../../../../app/component/routepage/schedule/ScheduleDropdown';
import PrintableStopHeader from '../../../../app/component/routepage/schedule/PrintableStopHeader';

describe('<ScheduleHeader />', () => {
  const defaultStops = [
    { id: 'stop1', name: 'First Stop' },
    { id: 'stop2', name: 'Second Stop' },
    { id: 'stop3', name: 'Third Stop' },
    { id: 'stop4', name: 'Fourth Stop' },
  ];

  const defaultProps = {
    stops: defaultStops,
    from: 0,
    to: 3,
    onFromSelectChange: sinon.spy(),
    onToSelectChange: sinon.spy(),
  };

  describe('Stop name display', () => {
    it('should display correct origin and destination names', () => {
      const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
      const stopHeaderDisplay = wrapper.find(PrintableStopHeader);

      expect(stopHeaderDisplay.prop('fromDisplayName')).to.equal('First Stop');
      expect(stopHeaderDisplay.prop('toDisplayName')).to.equal('Fourth Stop');
    });

    it('should update displayed names when origin changes', () => {
      const props = { ...defaultProps, from: 2 };
      const wrapper = shallow(<ScheduleHeader {...props} />);
      const stopHeaderDisplay = wrapper.find(PrintableStopHeader);

      expect(stopHeaderDisplay.prop('fromDisplayName')).to.equal('Third Stop');
    });

    it('should update displayed names when destination changes', () => {
      const props = { ...defaultProps, to: 1 };
      const wrapper = shallow(<ScheduleHeader {...props} />);
      const stopHeaderDisplay = wrapper.find(PrintableStopHeader);

      expect(stopHeaderDisplay.prop('toDisplayName')).to.equal('Second Stop');
    });
  });

  describe('Origin dropdown options', () => {
    it('should only include stops before destination', () => {
      const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
      const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
      const fromOptions = fromDropdown.prop('list');

      // to=3, so origin can be 0-2
      expect(fromOptions).to.have.lengthOf(3);
      expect(fromOptions[0]).to.deep.equal({ label: 'First Stop', value: 0 });
      expect(fromOptions[1]).to.deep.equal({ label: 'Second Stop', value: 1 });
      expect(fromOptions[2]).to.deep.equal({ label: 'Third Stop', value: 2 });
    });

    it('should adjust when destination moves', () => {
      const props = { ...defaultProps, from: 0, to: 2 };
      const wrapper = shallow(<ScheduleHeader {...props} />);
      const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
      const fromOptions = fromDropdown.prop('list');

      // to=2, so origin can only be 0-1
      expect(fromOptions).to.have.lengthOf(2);
      expect(fromOptions).to.deep.equal([
        { label: 'First Stop', value: 0 },
        { label: 'Second Stop', value: 1 },
      ]);
    });
  });

  describe('Destination dropdown options', () => {
    it('should only include stops after origin', () => {
      const wrapper = shallow(<ScheduleHeader {...defaultProps} />);
      const toDropdown = wrapper.find(ScheduleDropdown).at(1);
      const toOptions = toDropdown.prop('list');

      // from=0, so destination can be 1-3
      expect(toOptions).to.have.lengthOf(3);
      expect(toOptions[0]).to.deep.equal({ label: 'Second Stop', value: 1 });
      expect(toOptions[1]).to.deep.equal({ label: 'Third Stop', value: 2 });
      expect(toOptions[2]).to.deep.equal({ label: 'Fourth Stop', value: 3 });
    });

    it('should adjust when origin moves', () => {
      const props = { ...defaultProps, from: 2, to: 3 };
      const wrapper = shallow(<ScheduleHeader {...props} />);
      const toDropdown = wrapper.find(ScheduleDropdown).at(1);
      const toOptions = toDropdown.prop('list');

      // from=2, so destination can only be 3
      expect(toOptions).to.have.lengthOf(1);
      expect(toOptions[0]).to.deep.equal({ label: 'Fourth Stop', value: 3 });
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum two-stop route', () => {
      const twoStops = [
        { id: 'stop1', name: 'Start' },
        { id: 'stop2', name: 'End' },
      ];
      const props = { ...defaultProps, stops: twoStops, from: 0, to: 1 };
      const wrapper = shallow(<ScheduleHeader {...props} />);

      const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
      const toDropdown = wrapper.find(ScheduleDropdown).at(1);

      expect(fromDropdown.prop('list')).to.have.lengthOf(1);
      expect(toDropdown.prop('list')).to.have.lengthOf(1);
    });

    it('should handle many stops', () => {
      const manyStops = Array.from({ length: 20 }, (_, i) => ({
        id: `stop${i}`,
        name: `Stop ${i + 1}`,
      }));
      const props = { ...defaultProps, stops: manyStops, from: 0, to: 19 };
      const wrapper = shallow(<ScheduleHeader {...props} />);

      const fromDropdown = wrapper.find(ScheduleDropdown).at(0);
      const toDropdown = wrapper.find(ScheduleDropdown).at(1);

      // from can be 0-18, to can be 1-19
      expect(fromDropdown.prop('list')).to.have.lengthOf(19);
      expect(toDropdown.prop('list')).to.have.lengthOf(19);
    });
  });
});
