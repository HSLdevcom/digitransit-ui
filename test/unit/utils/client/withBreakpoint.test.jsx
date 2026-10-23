import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import withBreakpoint, {
  BreakpointContext as LegacyBreakpointContext,
} from '../../../../utils/client/withBreakpoint';
import { BreakpointContext } from '../../../../utils/client/BreakpointContext';

// eslint-disable-next-line react/prefer-stateless-function -- Tests ref forwarding to a class instance.
class BreakpointTarget extends React.Component {
  render() {
    const { breakpoint, label } = this.props;
    return <output>{`${label}: ${breakpoint}`}</output>;
  }
}

BreakpointTarget.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

describe('withBreakpoint compatibility', () => {
  it('passes other props and overrides the breakpoint prop with context', () => {
    const Wrapped = withBreakpoint(BreakpointTarget);
    const { getByText, rerender } = render(
      <BreakpointContext.Provider value="medium">
        <Wrapped label="Layout" breakpoint="small" />
      </BreakpointContext.Provider>,
    );
    expect(getByText('Layout: medium')).toBeTruthy();

    rerender(
      <BreakpointContext.Provider value="large">
        <Wrapped label="Layout" breakpoint="small" />
      </BreakpointContext.Provider>,
    );
    expect(getByText('Layout: large')).toBeTruthy();
  });

  it('forwards refs when requested and accepts the legacy context export', () => {
    const Wrapped = withBreakpoint(BreakpointTarget, { forwardRef: true });
    const ref = createRef();
    const { getByText } = render(
      <LegacyBreakpointContext.Provider value="small">
        <Wrapped label="Layout" ref={ref} />
      </LegacyBreakpointContext.Provider>,
    );
    expect(getByText('Layout: small')).toBeTruthy();
    expect(ref.current).toBeInstanceOf(BreakpointTarget);
  });
});
