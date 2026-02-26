import { FormattedMessage } from 'react-intl';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import Icon from '../Icon';
import { useBreakpoint } from '../../util/withBreakpoint';
import { useConfigContext } from '../../configurations/ConfigContext';
import { useTranslationsContext } from '../../util/useTranslationsContext';

const AdditionalDescription = () => {
  const intl = useTranslationsContext();
  const {
    URL: { HOLIDAYS_AND_EXCEPTIONS, MAJOR_CHANGES },
    language,
  } = useConfigContext();

  const links = [
    {
      key: 'link1',
      href: HOLIDAYS_AND_EXCEPTIONS[language],
      message: {
        id: 'traffic-now_description_see-also--link1',
        defaultMessage: 'holidays and exceptions',
      },
    },
    ...(MAJOR_CHANGES && MAJOR_CHANGES[language]
      ? [
          {
            key: 'link2',
            href: MAJOR_CHANGES[language],
            message: {
              id: 'traffic-now_description_see-also--link2',
              defaultMessage: 'major changes',
            },
          },
        ]
      : []),
  ];

  return (
    <FormattedMessage
      id="traffic-now_description_see-also"
      defaultMessage="See also {link1} as well as {link2}, which you will find in detail on their own pages"
      values={links.reduce(
        (acc, link) => ({
          ...acc,
          [link.key]: (
            <a href={link.href}>{intl.formatMessage(link.message)}</a>
          ),
        }),
        { amount: links.length },
      )}
    />
  );
};

export default function Header() {
  const breakpoint = useBreakpoint();
  const { CONFIG } = useConfigContext();

  const desktop = breakpoint === 'large';
  return (
    <div
      className={cx('traffic-now__header', {
        'traffic-now__header--mobile': !desktop,
      })}
    >
      <span className="traffic-now__header-breadcrumb link-small">
        <Link to="/">
          <FormattedMessage id="traffic-now_bread" />
        </Link>
        <Icon
          img="icon_chevron-right"
          className="traffic-now__header-crumbarrow"
        />
        <FormattedMessage id="traffic-now" />
      </span>
      <h2 className="heading-l">
        <FormattedMessage id="traffic-now" />
      </h2>
      <p className="traffic-now__header-description text-l">
        <FormattedMessage id="traffic-now_description" />
        {CONFIG === 'hsl' && <AdditionalDescription />}
      </p>
    </div>
  );
}

Header.propTypes = {};
Header.defaultProps = {};
