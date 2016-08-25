import connectToStores from 'fluxible-addons-react/connectToStores';

import ModeFilter from '../util/ModeFilter';
import ModeSelectedAction from '../../action/mode-selected-action';

export default connectToStores(
  ModeFilter,
  ['ModeStore'],
  (context) =>
    ({
      modes: context.getStore('ModeStore').getMode(),
      buttonClass: 'btn mode-nearby',
      action: ModeSelectedAction,
    })
);
