import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMatch } from 'found';
import { useConfigContext } from '../hooks/ConfigContext';
import { createLanguageHref } from '../../utils/shared/languageUtils';

const Language = ({ lang }) => {
  const intl = useIntl();
  const config = useConfigContext();
  const match = useMatch();
  const highlight = lang === intl.locale;

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
      href={createLanguageHref(config, lang, match.location)}
      className={`${(highlight && 'selected') || ''} noborder lang`}
    >
      {lang}
    </a>
  );
};

Language.propTypes = { lang: PropTypes.string.isRequired };

export default function LanguageSelect() {
  const { availableLanguages } = useConfigContext();
  return (
    <div key="lang-select" id="lang-select">
      {availableLanguages.map(lang => (
        <Language key={lang} lang={lang} />
      ))}
    </div>
  );
}
