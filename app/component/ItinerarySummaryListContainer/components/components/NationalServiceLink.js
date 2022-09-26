import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';

const NationalServiceLink = ({ currentLanguage, nationalServiceLink }) => {
  if (!nationalServiceLink) {
    return null;
  }

  const { href, name } = nationalServiceLink[currentLanguage];

  return (
    <div>
      <FormattedMessage
        id="use-national-service-prefix"
        defaultMessage="You can also try the national service available at"
      />
      <a className="no-decoration" href={href}>
        {name}
      </a>
      <FormattedMessage id="use-national-service-postfix" defaultMessage="" />
    </div>
  );
};
NationalServiceLink.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
  nationalServiceLink: PropTypes.objectOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    }),
  ),
};

NationalServiceLink.defaultProps = {
  nationalServiceLink: null,
};

NationalServiceLink.displayName = 'NationalServiceLink';

const connectedComponent = connectToStores(
  NationalServiceLink,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, NationalServiceLink as Component };
