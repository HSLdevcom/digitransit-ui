// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// import React from 'react';
// import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
// import FavouriteLocationsContainer from '../../../app/component/FavouriteLocationsContainer';
// import Icon from '../../../app/component/Icon';
// import FavouriteLocation from '../../../app/component/FavouriteLocation';

// describe('<FavouriteLocationsContainer />', () => {
//   const props = {
//     favourites: [],
//     onClickFavourite: () => ({}),
//     onAddFavourite: () => ({}),
//   };
//   const home = {
//     name: 'Home',
//     address: 'HSL, Opastinsilta 6A, Helsinki',
//     selectedIconId: 'icon-icon_home',
//   };
//   const work = {
//     name: 'Work',
//     address: 'Pasila, Helsinki',
//     selectedIconId: 'icon-icon_work',
//   };
//   it('should render correct button when there are no favourites', () => {
//     const wrapper = shallowWithIntl(<FavouriteLocationsContainer {...props} />);
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(0)
//         .prop('text'),
//     ).to.equal('add-home');
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(1)
//         .prop('text'),
//     ).to.equal('add-work');
//     expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_plus');
//   });

//   it('should render correct buttons when work is defined in favourites', () => {
//     const favourites = [work];
//     const wrapper = shallowWithIntl(
//       <FavouriteLocationsContainer {...props} favourites={favourites} />,
//     );
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(0)
//         .prop('text'),
//     ).to.equal('add-home');
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(1)
//         .prop('favourite'),
//     ).to.own.include(work);
//     expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_arrow-dropdown');
//   });

//   it('should render correct buttons when home is defined in favourites', () => {
//     const favourites = [home];
//     const wrapper = shallowWithIntl(
//       <FavouriteLocationsContainer {...props} favourites={favourites} />,
//     );
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(0)
//         .prop('favourite'),
//     ).to.own.include(home);
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(1)
//         .prop('text'),
//     ).to.equal('add-work');
//     expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_arrow-dropdown');
//   });

//   it('should render correct buttons when home and work is defined in favourites', () => {
//     const favourites = [
//       home,
//       work,
//       {
//         name: 'Steissi',
//         address: 'Rautatientori, Helsinki',
//         selectedIconId: 'icon-icon_location',
//       },
//     ];
//     const wrapper = shallowWithIntl(
//       <FavouriteLocationsContainer {...props} favourites={favourites} />,
//     );
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(0)
//         .prop('favourite'),
//     ).to.equal(home);
//     expect(
//       wrapper
//         .find(FavouriteLocation)
//         .at(1)
//         .prop('favourite'),
//     ).to.own.include(work);
//     expect(wrapper.find(Icon).prop('img')).to.equal('icon-icon_arrow-dropdown');
//   });

//   it('should open suggestion list on click', () => {
//     const favourites = [home, work];
//     const wrapper = shallowWithIntl(
//       <FavouriteLocationsContainer {...props} favourites={favourites} />,
//     );
//     expect(wrapper.find('.favourite-suggestion-list')).to.have.lengthOf(0);
//     wrapper.find('.favourite-container-expand').simulate('click');
//     expect(wrapper.find('.favourite-suggestion-list')).to.have.lengthOf(1);
//   });
// });
