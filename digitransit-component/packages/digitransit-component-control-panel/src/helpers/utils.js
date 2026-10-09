export const VALID_NEAR_YOU_MODES = [
  'favorite',
  'bus',
  'tram',
  'rail',
  'subway',
  'airplane',
  'ferry',
  'citybike',
  'bikepark',
  'carpark',
];

const NO_THEME_MODES = ['bikepark', 'carpark', 'subway', 'airplane']; // common icon in all themes

const SELECTION_KEYS = ['Enter', ' ', 'Spacebar'];

export function getIconName(mode, modeSet, boxed) {
  const theme = NO_THEME_MODES.includes(mode) ? '' : `-${modeSet}`;
  const fill = boxed ? '' : '-fill'; // do not render boxed icon for vertical
  return `${mode}${fill}${theme}`;
}

export function isKeyboardSelectionEvent(event) {
  if (!SELECTION_KEYS.includes(event?.key)) {
    return false;
  }
  event.preventDefault();
  return true;
}

/** Builds the near you url for a mode, e.g. /fi/nearyou/BUS/POS/Address::lat,lon */
export function getModeUrl({
  urlPrefix,
  language,
  omitLanguageUrl,
  origin,
  mode,
}) {
  let urlStart = urlPrefix;
  if (!omitLanguageUrl) {
    const urlParts = urlPrefix.split('/');
    urlParts.splice(urlParts.length - 1, 0, language);
    urlStart = urlParts.join('/');
  }
  const position =
    origin.lat && origin.lon
      ? `/POS/${encodeURIComponent(origin.address)}::${origin.lat},${
          origin.lon
        }`
      : '/POS';
  return `${urlStart}/${mode.toUpperCase()}${position}`;
}
