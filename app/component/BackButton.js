import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, matchShape } from 'found';
import { intlShape } from 'react-intl';
import Icon from './Icon';

export default class BackButton extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape,
    match: matchShape,
  };

  static propTypes = {
    icon: PropTypes.string,
    className: PropTypes.string,
    color: PropTypes.string,
    title: PropTypes.node,
  };

  static defaultProps = {
    icon: 'icon-icon_arrow-left',
    className: 'back',
    color: 'white',
    title: undefined,
  };

  goBack = () => {
    const pathArray = this.context.match.location.pathname
      .substring(1)
      .split('/');
    if (this.context.match.location.index > 0) {
      this.context.router.go(-1);
    } else if (
      this.context.match.location.action === 'POP' &&
      Array.isArray(pathArray) &&
      pathArray[0] === 'reitti'
    ) {
      this.context.router.push(
        `/${pathArray[1]}/-${this.context.match.location.search}`,
      );
    } else {
      this.context.router.push('/');
    }
  };

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <button
          className="icon-holder noborder cursor-pointer"
          style={{ paddingTop: '7px' }}
          onClick={this.goBack}
          aria-label={this.context.intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
        >
          <Icon
            img={this.props.icon}
            color={this.props.color}
            className={`${this.props.className} cursor-pointer`}
          />
        </button>
        {this.props.title && <h1 className="h2">{this.props.title}</h1>}
      </div>
    );
  }
}
