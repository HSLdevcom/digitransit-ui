import PropTypes from 'prop-types';
import React from 'react';
import { routerShape, locationShape } from 'react-router';
import AdminForm from './AdminForm';

class AdminPage extends React.Component {
  static propTypes = {
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  };
  
  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  state = { loading: true };

  componentDidMount() {
    const router = this.props.router;
    if (this.context.config.CONFIG != 'default') {
      const OTPURLSplit = this.context.config.URL.OTP.split('/');
      const dataContainerURL = `${this.context.config.URL.API_URL}/routing-data/v2/${OTPURLSplit[OTPURLSplit.length - 2]}/router-config.json`;
      fetch(dataContainerURL).then(res => {
        res.json().then(json => {
          this.setState({ router, loading: false, dataConDefaults: json.routingDefaults});
        }).catch((err) => {
          this.setState({ router, loading: false, dataConDefaults: {}});
        })
      }).catch((err) => {
        this.setState({ router, loading: false, dataConDefaults: {}});
      });
    } else {
      this.setState({ router, loading: false, dataConDefaults: {}});
    }
  };

  render() {
    return <AdminForm {...this.state} />;
  }
};

export default AdminPage;
