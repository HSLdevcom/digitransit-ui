import ModeFilter from '../util/ModeFilter';
import ModeSelectedAction from '../../action/mode-selected-action';
import connectToStores from 'fluxible-addons-react/connectToStores';

export default connectToStores(
  ModeFilter,
  ['ModeStore'],
  (context) =>
    ({
      selectedModes: context.getStore('ModeStore').getMode(),
      buttonClass: 'btn mode-nearby',
      action: ModeSelectedAction,
    })
);
