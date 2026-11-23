export default function localizedUrl(object, lang) {
  if (!object) {
    return null;
  }
  return object[lang] || object[Object.keys(object)[0]];
}
