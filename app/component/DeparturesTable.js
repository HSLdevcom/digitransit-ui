import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

class DeparturesTable extends React.Component {
  static propTypes = {
    headers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        defaultMessage: PropTypes.string.isRequired,
      }),
    ).isRequired,
    content: PropTypes.arrayOf(PropTypes.element).isRequired,
  };

  static contextTypes = {
    breakpoint: PropTypes.string,
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
      <div
        className={`nearby-table-container ${this.context.breakpoint !==
          'large' && `mobile`}`}
      >
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
