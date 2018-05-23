import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

const { Provider, Consumer } = createContext('large');

function getClientBreakpoint() {
  if (window.innerWidth < 400) {
    return 'small';
  } else if (window.innerWidth < 900) {
    return 'medium';
  }
  return 'large';
}

export function getServerBreakpoint(userAgent) {
  return userAgent && userAgent.toLowerCase().includes('mobile')
    ? 'small'
    : 'large';
}

export class ClientProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    serverGuessedBreakpoint: PropTypes.string,
  };

  static defaultProps = {
    serverGuessedBreakpoint: null,
  };

  state = {
    breakpoint: this.props.serverGuessedBreakpoint || getClientBreakpoint(),
  };

  componentDidMount() {
    this.updateBreakpoint = throttle(
      () =>
        this.setState(
          ({ breakpoint }) =>
            getClientBreakpoint() !== breakpoint
              ? { breakpoint: getClientBreakpoint() }
              : null,
        ),
      100,
    );
    this.updateBreakpoint();
    window.addEventListener('resize', this.updateBreakpoint);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBreakpoint);
  }

  render() {
    return <Provider value={this.state.breakpoint} {...this.props} />;
  }
}

export const BreakpointProvider = Provider;
export const BreakpointConsumer = Consumer;

export function DesktopOrMobile({ desktop, mobile }) {
  return (
    <Consumer>
      {breakpoint => (breakpoint === 'large' ? desktop() : mobile())}
    </Consumer>
  );
}

DesktopOrMobile.propTypes = {
  desktop: PropTypes.func.isRequired,
  mobile: PropTypes.func.isRequired,
};

export default function withBreakpoint(Component) {
  return function WithBreakpoint(props) {
    return (
      <Consumer>
        {breakpoint => <Component {...props} breakpoint={breakpoint} />}
      </Consumer>
    );
  };
}
