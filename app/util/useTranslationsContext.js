import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';

const IntlContext = createContext();

export const IntlContextProvider = ({ intl, children }) => (
  <IntlContext.Provider value={intl}>{children}</IntlContext.Provider>
);

IntlContextProvider.propTypes = {
  intl: intlShape.isRequired,
  children: PropTypes.node.isRequired,
};

export const useTranslationsContext = () => {
  const intl = useContext(IntlContext);
  if (!intl) {
    throw new Error(
      'useTranslationsContext must be used within an IntlContextProvider. ' +
        'Make sure your component is wrapped in StoreListeningIntlProvider.',
    );
  }
  return intl;
};
