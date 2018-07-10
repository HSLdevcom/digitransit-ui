import React from 'react';
import PropTypes from 'prop-types';

class Loading extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  static displayName = 'Loading';

  constructor() {
    super();
    this.state = {
      spinner: null,
    };
  }

  componentDidMount() {
    import(/* webpackChunkName: "main" */ `../configurations/images/${
      this.context.config.spinner
    }`).then(spinner => {
      this.setState({ spinner: spinner.default });
    });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.spinner && (
          <div
            className="spinner-loader"
            style={{ backgroundImage: `url(${this.state.spinner})` }}
          >
            {(this.props && this.props.children) || null}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Loading;
