import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../hooks/ConfigContext';
import { useSearchContext } from '../hooks/SearchContext';
import SelectFromMap from './map/SelectFromMap';
import SelectFromMapModal from './SelectFromMapModal';

export default function SearchSelectionBoundary({ children = null }) {
  const intl = useIntl();
  const config = useConfigContext();
  const { fromMap, closeMapSelection, confirmMapSelection } =
    useSearchContext();

  if (fromMap === undefined) {
    return children;
  }

  let titleId = '';
  if (fromMap === 'origin') {
    titleId = 'select-from-map-origin';
  } else if (fromMap === 'destination') {
    titleId = 'select-from-map-destination';
  } else if (fromMap === 'favourite') {
    titleId = 'select-from-map-favourite';
  } else if (fromMap === parseInt(fromMap, 10)) {
    titleId = 'select-from-map-viaPoint';
  }

  return (
    <SelectFromMapModal
      title={intl.formatMessage({ id: titleId })}
      lang={config.language}
      onClose={closeMapSelection}
    >
      <SelectFromMap type={fromMap} onConfirm={confirmMapSelection} />
    </SelectFromMapModal>
  );
}

SearchSelectionBoundary.propTypes = {
  children: PropTypes.node,
};
