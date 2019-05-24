import mergeWith from 'lodash/mergeWith';

// merge two arrays by identifying array items by their 'header' field.
// matching src values overwrite objvalues
function aboutMerger(objValue, srcValue) {
  if (Array.isArray(srcValue) && Array.isArray(objValue)) {
    const objByHdr = {};
    const srcByHdr = {};

    objValue.filter(val => val.header).forEach(val => {
      objByHdr[val.header] = val;
    });
    srcValue.filter(val => val.header).forEach(val => {
      srcByHdr[val.header] = val;
    });

    return objValue
      .map(
        val =>
          srcByHdr[val.header]
            ? {
                ...val,
                ...srcByHdr[val.header],
              }
            : val,
      )
      .concat(
        // insert unmatching items from src
        srcValue.filter(val => !objByHdr[val.header]),
      );
  }
  return undefined; // Otherwise use default customizer
}

function merger(objValue, srcValue, key) {
  if (key === 'aboutThisService') {
    // property inheritance from objValue to srcValue
    return mergeWith({}, objValue, srcValue, aboutMerger);
  }
  if (Array.isArray(srcValue)) {
    return srcValue;
  } // Return only latest if array
  if (Array.isArray(objValue)) {
    return objValue;
  }

  return undefined; // Otherwise use default customizer
}

export default function configMerger(obj, src) {
  return mergeWith({}, obj, src, merger);
}
