import PropTypes from 'prop-types';
import React from 'react';
import DatetimepickerA from 'datetimepicker-A';
import DatetimepickerB from 'datetimepicker-B';
import {
  Experiment,
  Variant,
  experimentDebugger,
  emitter,
} from '@marvelapp/react-ab-test';

const EXPERIMENT_NAME = 'datetimepicker';

experimentDebugger.enable();
emitter.defineVariants(EXPERIMENT_NAME, ['A', 'B']);

/**
 * AB testing for new and old design for mobile datetimepicker
 * Props are same as the datetimepicker component except two additional ones:
 *
 * @param {'A'|'B'|undefined} props.forceVariant optionally force either variant A or B
 * @param {function} props.onVariantSelected called with selected variant on first render
 */
function MobileDatetimepickerTest({
  forceVariant,
  onVariantSelected,
  ...props
}) {
  // set active variant on first render
  // this will get called even if variant is stored in localStorage already, but is
  if (!emitter.getActiveVariant(EXPERIMENT_NAME)) {
    if (forceVariant) {
      emitter.setActiveVariant(EXPERIMENT_NAME, forceVariant);
    } else {
      // if variant is defined already, this does not recalculate it
      emitter.calculateActiveVariant(EXPERIMENT_NAME);
      onVariantSelected(emitter.getActiveVariant(EXPERIMENT_NAME));
    }
  }

  return (
    <Experiment name={EXPERIMENT_NAME}>
      <Variant name="A">
        <DatetimepickerA {...props} />
      </Variant>
      <Variant name="B">
        <DatetimepickerB {...props} />
      </Variant>
    </Experiment>
  );
}

MobileDatetimepickerTest.propTypes = {
  forceVariant: PropTypes.string,
  onVariantSelected: PropTypes.func,
};

MobileDatetimepickerTest.defaultProps = {
  forceVariant: null,
  onVariantSelected: () => {},
};

export default MobileDatetimepickerTest;
