// import React from 'react';

// import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
// import { mountWithIntl } from '../helpers/mock-intl-enzyme';
// import { Component as ItinerarySummaryListContainer } from '../../../app/component/ItinerarySummaryListContainer';

// describe('<ItinerarySummaryListContainer />', () => {
//   it('should render the component for canceled itineraries', () => {
//     // TODO: enzyme is currently missing support for react hooks
//     const props = {
//       activeIndex: 0,
//       currentTime: 1234567890,
//       from: {},
//       onSelect: () => {},
//       onSelectImmediately: () => {},
//       searchTime: 1234567890,
//       to: {},
//     };
//     const wrapper = mountWithIntl(
//       <div>
//         <ItinerarySummaryListContainer {...props} />
//       </div>,
//       { context: { ...mockContext } },
//       { childContextTypes: { ...mockChildContextTypes } },
//     );
//     expect(wrapper.debug()).to.equal(undefined);
//   });
// });
