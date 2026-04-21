import React from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../configurations/ConfigContext';

const Language = ({ lang }, { match }) => {
  const { language } = useConfigContext();
  const intl = useIntl();
  const highlight = lang === language;

  const aria = highlight
    ? intl.formatMessage(
        { id: 'search-current-suggestion' },
        { selection: lang },
      )
    : intl.formatMessage({ id: 'language-selection' }, { language: lang });
  return (
    <a
      id={`lang-${lang}`}
      aria-label={aria}
      key={lang}
      href={`/${lang}${match.location.pathname}${match.location.search}`}
      className={`${(highlight && 'selected') || ''} noborder lang`}
    >
      {lang}
    </a>
  );
};

Language.contextTypes = { match: matchShape.isRequired };
Language.propTypes = { lang: PropTypes.string.isRequired };

const LanguageSelect = ({}, { match }) => { // eslint-disable-line
  const { availableLanguages } = useConfigContext();
  return (
    <div key="lang-select" id="lang-select">
      {availableLanguages.map(lang => (
        <Language key={lang} lang={lang} />
      ))}
    </div>
  );
};

export default LanguageSelect;
