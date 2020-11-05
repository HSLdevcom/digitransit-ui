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
    config: PropTypes.object,
  };

  static propTypes = {
    icon: PropTypes.string,
    color: PropTypes.string,
    iconClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string, // DT-3472
    titleCustomStyle: PropTypes.object,
    urlToBack: PropTypes.string,
    className: PropTypes.string, // DT-3614
    onBackBtnClick: PropTypes.func,
  };

  static defaultProps = {
    icon: 'icon-icon_arrow-left',
    color: 'white',
    iconClassName: '',
    title: undefined,
    titleClassName: undefined, // DT-3472
    titleCustomStyle: undefined,
    urlToBack: undefined,
    className: 'back-button', // DT-3614
  };

  goBack = urlToGo => {
    if (
      this.context.match.location.index > 0 ||
      (this.context.match.params && this.context.match.params.hash)
    ) {
      this.context.router.go(-1);
    } else if (urlToGo) {
      const { config, intl } = this.context;
      if (
        config.passLanguageToRootLink &&
        urlToGo.indexOf(config.URL.ROOTLINK) !== -1 &&
        intl.locale !== 'fi'
      ) {
        window.location.href = `${urlToGo}/${intl.locale}`;
      } else {
        window.location.href = urlToGo;
      }
    } else {
      this.context.router.push('/');
    }
  };

  onClick = () => {
    this.props.onBackBtnClick();
  };

  render() {
    return (
      <div className={this.props.className} style={{ display: 'flex' }}>
        <button
          className="icon-holder noborder cursor-pointer"
          onClick={
            this.props.onBackBtnClick
              ? this.onClick
              : () => this.goBack(this.props.urlToBack)
          }
          aria-label={this.context.intl.formatMessage({
            id: 'back-button-title',
            defaultMessage: 'Go back to previous page',
          })}
        >
          <Icon
            img={this.props.icon}
            color={this.props.color}
            className={`${this.props.iconClassName} cursor-pointer`}
          />
        </button>
        {this.props.title &&
          !this.props.titleClassName &&
          !this.props.titleCustomStyle && (
            <h2 className="h2">{this.props.title}</h2>
          )}
        {this.props.title &&
          this.props.titleClassName &&
          !this.props.titleCustomStyle && (
            <span className={this.props.titleClassName}>
              {this.props.title}
            </span>
          )}
        {this.props.title && this.props.titleCustomStyle && (
          <span style={this.props.titleCustomStyle}>{this.props.title}</span>
        )}
      </div>
    );
  }
}
