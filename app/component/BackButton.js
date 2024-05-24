import React from 'react';
import PropTypes from 'prop-types';
import { routerShape, matchShape } from 'found';
import { intlShape } from 'react-intl';
import { configShape } from '../util/shapes';
import Icon from './Icon';

export default class BackButton extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape,
    match: matchShape,
    config: configShape,
  };

  static propTypes = {
    icon: PropTypes.string,
    color: PropTypes.string,
    iconClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    className: PropTypes.string,
    onBackBtnClick: PropTypes.func,
    fallback: PropTypes.string,
  };

  static defaultProps = {
    icon: 'icon-icon_arrow-left',
    color: undefined,
    iconClassName: '',
    title: undefined,
    titleClassName: undefined,
    className: 'back-button',
    fallback: undefined,
    onBackBtnClick: undefined,
  };

  goBack = url => {
    const { router, match } = this.context;
    const { location } = match;

    if (
      location.index > 0 ||
      // eslint-disable-next-line no-restricted-globals
      (history.length > 1 && this.props.fallback === 'back')
    ) {
      router.go(-1);
    } else if (
      this.props.fallback === 'pop' &&
      location.pathname.split('/').length > 1
    ) {
      const parts = location.pathname.split('/');
      parts.pop();
      const newLoc = {
        ...location,
        pathname: parts.join('/'),
      };
      router.replace(newLoc);
    } else if (url) {
      window.location.href = url;
    } else {
      router.push('/');
    }
  };

  render() {
    let url;
    const { config, intl } = this.context;
    // apply rootlink only in production, it is annoying locally
    if (!this.props.onBackBtnClick && config.NODE_ENV !== 'development') {
      if (config.passLanguageToRootLink && intl.locale !== 'fi') {
        url = `${config.URL.ROOTLINK}/${intl.locale}`;
      } else {
        url = config.URL.ROOTLINK;
      }
    }
    return (
      <div className={this.props.className} style={{ display: 'flex' }}>
        {this.props.title && !this.props.titleClassName && (
          <h1 className="h1">{this.props.title}</h1>
        )}
        {this.props.title && this.props.titleClassName && (
          <span className={this.props.titleClassName}>{this.props.title}</span>
        )}
        <button
          type="button"
          className="icon-holder noborder cursor-pointer"
          onClick={
            this.props.onBackBtnClick
              ? this.props.onBackBtnClick
              : () => this.goBack(url)
          }
          aria-label={this.context.intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
          tabIndex={0}
        >
          <Icon
            img={this.props.icon}
            color={this.props.color || this.context.config.colors.primary}
            className={`${this.props.iconClassName} cursor-pointer`}
          />
        </button>
      </div>
    );
  }
}
