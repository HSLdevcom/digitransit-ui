import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

export default class NavBarDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMenu: false,
    };
    this.showDropdownMenu = this.showDropdownMenu.bind(this);
    this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
  }
  showDropdownMenu(event) {
    event.preventDefault();
    this.setState({ displayMenu: true }, () => {
      document.addEventListener('click', this.hideDropdownMenu);
    });
  }

  hideDropdownMenu() {
    this.setState({ displayMenu: false }, () => {
      document.removeEventListener('click', this.hideDropdownMenu);
    });
  }
  render() {
    return (
      <div className="dropdown" style={{ background: 'red', width: '200px' }}>
        <div className="button" onClick={this.showDropdownMenu}>
          {' '}
          My Setting{' '}
        </div>

        {this.state.displayMenu ? (
          <ul>
            <li>
              <a className="active" href="#Create Page">
                Create Page
              </a>
            </li>
            <li>
              <a href="#Setting">Setting</a>
            </li>
            <li>
              <a href="#Log Out">Log Out</a>
            </li>
          </ul>
        ) : null}
      </div>
    );
  }
}
