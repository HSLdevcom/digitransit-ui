import PropTypes from 'prop-types';
import React from 'react';
import AdminForm from './AdminForm';

class AdminPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = { loading: true, dataConDefaults: {}, modeWeightDefaults: {} };

  componentDidMount() {
    const flattenModeWeight = modeWeights => {
      const flattenedWeight = modeWeights;
      Object.keys(modeWeights).forEach(weight => {
        flattenedWeight[`${weight.toLowerCase()}Weight`] =
          flattenedWeight[weight];
        delete flattenedWeight[weight];
      });
      return flattenedWeight;
    };

    const OTPURLSplit = this.context.config.URL.OTP.split('/');
    const dataContainerURL = `${
      this.context.config.URL.API_URL
    }/routing-data/v2/${
      OTPURLSplit[OTPURLSplit.length - 2]
    }/router-config.json`;
    fetch(dataContainerURL)
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            loading: false,
            dataConDefaults: result.routingDefaults,
            modeWeightDefaults:
              result.modeWeight !== undefined
                ? flattenModeWeight(result.modeWeight)
                : {},
          });
        },
        err => {
          console.log(err); // eslint-disable-line no-console
          this.setState({ loading: false });
        },
      );
  }

  render() {
    return <AdminForm {...this.state} />;
  }
}

export default AdminPage;
