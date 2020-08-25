/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow, configure } from 'enzyme';
import CtrlPanel from './src';

configure({ adapter: new Adapter() });

describe('Testing @digitransit-component/digitransit-component-control-panel module', () => {
  const wrapper = shallow(
    <CtrlPanel language="fi" position="left">
      <CtrlPanel.OriginToDestination showTitle />
      <CtrlPanel.SeparatorLine />
      <CtrlPanel.NearStopsAndRoutes
        showTitle
        buttons={['bus', 'tram', 'subway', 'rail', 'ferry', 'citybike']}
      />
    </CtrlPanel>,
  );

  it('should render', () => {
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
  it("should create a 'separator line' element", () => {
    expect(wrapper.find(CtrlPanel.SeparatorLine)).to.have.lengthOf(1);
  });
  it("should create a 'origin to destination' element", () => {
    expect(wrapper.find(CtrlPanel.OriginToDestination)).to.have.lengthOf(1);
  });
  it("should create a 'near stops and routes' element", () => {
    expect(wrapper.find(CtrlPanel.NearStopsAndRoutes)).to.have.lengthOf(1);
  });
});
