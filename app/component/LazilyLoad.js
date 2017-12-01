import PropTypes from 'prop-types';
import React from 'react';

// From https://webpack.js.org/guides/lazy-load-react/

class LazilyLoad extends React.Component {
  static propTypes = {
    modules: PropTypes.objectOf(PropTypes.func.isRequired).isRequired,
  };

  state = {
    isLoaded: false,
  };

  componentDidMount() {
    this.componentMounted = true;
    this.load(this.props);
  }

  componentWillReceiveProps(next) {
    if (next.modules === this.props.modules) {
      return;
    }
    this.load(next);
  }

  componentWillUnmount() {
    this.componentMounted = false;
  }

  load({ modules }) {
    this.setState({
      isLoaded: false,
    });

    const keys = Object.keys(modules);

    Promise.all(keys.map(key => modules[key]()))
      .then(values =>
        keys.reduce((agg, key, index) => {
          agg[key] = values[index]; // eslint-disable-line no-param-reassign
          return agg;
        }, {}),
      )
      .then(result => {
        if (!this.componentMounted) {
          return;
        }
        this.setState({ modules: result, isLoaded: true });
      });
  }

  render() {
    if (!this.state.isLoaded) {
      return null;
    }
    return React.Children.only(this.props.children(this.state.modules));
  }
}

LazilyLoad.propTypes = {
  children: PropTypes.func.isRequired,
};

export const LazilyLoadFactory = (Component, modules) => props => (
  <LazilyLoad modules={modules}>
    {mods => <Component {...mods} {...props} />}
  </LazilyLoad>
);

export const importLazy = promise => promise.then(result => result.default);

export default LazilyLoad;
