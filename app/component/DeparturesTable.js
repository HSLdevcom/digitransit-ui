import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

class DeparturesTable extends React.Component {
  static propTypes = {
    headers: PropTypes.array.isRequired,
    content: PropTypes.array,
  };
  checkContent = () => (this.props.content ? this.props.content : null);
  constructHeaders = headers =>
    headers.map(o => (
      <th key={`${o.id}-${o.defaultMessage}`} className={`th-${o.id}`}>
        <FormattedMessage id={o.id} defaultMessage={o.defaultMessage} />
      </th>
    ));

  render() {
    return (
      <div className="nearby-table-container">
        <table className="nearby-departures-table">
          <thead>
            <tr className="header-tr">
              {this.constructHeaders(this.props.headers)}
            </tr>
          </thead>
          <tbody>{this.checkContent()}</tbody>
        </table>
      </div>
    );
  }
}

export default DeparturesTable;
