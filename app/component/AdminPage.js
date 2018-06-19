import PropTypes from 'prop-types';
import React from 'react';
import AdminForm from './AdminForm';

class AdminPage extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = { loading: true, dataConDefaults: {} };

  componentDidMount() {
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
          });
        },
        err => {
          console.log(err);
          this.setState({ loading: false });
        },
      );
  }

  render() {
    return <AdminForm {...this.state} />;
  }
}

export default AdminPage;
