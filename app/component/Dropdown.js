import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listOpen: false,
    };
  }

  handleClickOutside() {
    this.setState({
      listOpen: false,
    });
  }

  toggleList() {
    this.setState(prevState => ({
      listOpen: !prevState.listOpen,
    }));
  }

  render() {
    const { list } = this.props;
    const { listOpen } = this.state;
    const rightBorder = !listOpen ? 'right-border' : '';
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid */
    return (
      <div className={`dropdown-wrapper ${rightBorder}`}>
        <button className="noborder" onClick={() => this.toggleList()}>
          <div className="dropdown-header">
            <div className="dropdown-title">
              <Icon
                img="icon-icon_user"
                width={1.25}
                height={1.25}
                color="#fff"
              />
              <div className="dropdown-title-text">{this.props.username}</div>
              <div className={listOpen ? 'rotate-icon' : ''}>
                <Icon img="icon-icon_arrow-dropdown" color="#fff" />
              </div>
            </div>
          </div>
        </button>
        {listOpen && (
          <div className="dropdown-list">
            {/* eslint-disable jsx-a11y/click-events-have-key-events */}
            {list.map(item => (
              <button
                className="noborder"
                key={`dropdown-item-${item.key}`}
                onClick={() => item.onClick()}
              >
                <div className="dropdown-list-item">
                  <FormattedMessage
                    id={item.messageId}
                    defaultMessage={item.messageId}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

Dropdown.propTypes = {
  username: PropTypes.string.isRequired,
  list: PropTypes.array,
};
