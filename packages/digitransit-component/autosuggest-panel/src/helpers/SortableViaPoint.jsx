import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/react/sortable';

/** Sortable via point row; children is called with the drag handle ref. */
function SortableViaPoint({ id, index, disabled, className, children }) {
  const { ref, handleRef } = useSortable({ id, index, disabled });
  return (
    <div ref={ref} className={className}>
      {children(handleRef)}
    </div>
  );
}

SortableViaPoint.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

export default SortableViaPoint;
