import React from 'react';
import Relay from 'react-relay';

import RoutePatternSelect from './RoutePatternSelect';

class RoutePatternSelectWrapper extends React.Component {
  static propTypes = {
    children: React.PropTypes.node,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
    }).isRequired,
    params: React.PropTypes.shape({
      patternId: React.PropTypes.string.isRequired,
    }).isRequired,
  }

  static contextTypes = {
    router: React.PropTypes.shape({
      replace: React.PropTypes.func.isRequired,
    }).isRequired,
  }

  onSelectChange = (e) =>
    this.context.router.replace(
      decodeURIComponent(this.props.location.pathname)
        .replace(this.props.params.patternId, e.target.value)
    );

  render() {
    const { children, ...rest } = this.props;

    return (
      <div>
        <RoutePatternSelect {...rest} onSelectChange={this.onSelectChange} />
        {children}
      </div>
    );
  }
}

export default Relay.createContainer(RoutePatternSelectWrapper, {
  fragments: {
    route: () => Relay.QL`
      fragment on Route {
        patterns {
          code
          headsign
          stops {
            name
          }
        }
      }
    `,
  },
});
