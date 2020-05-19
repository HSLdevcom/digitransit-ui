import get from 'lodash/get';

/**
 * Function that filters list matching to input.
 *
 * @name filterMatchingToInput
 * @param {Array} list List containin objects e.g(  {
 *         type: 'Feature'
 *         properties: {
 *           label: 'testaddress4',
 *           layer: 'address',
 *           name: 'testaddress4',
 *         },
 *         geometry: { coordinates: [lon, lat] },
 *       },)
 * @param {String} Input Input given for filtering the list
 * @param {Array} fields List of fields that list is filtered by e.g ([properties.label, properties.name])
 * @returns {Array} Filtered Array.
 * @example
 * digitransit-util.filterMatchingToInput([{type: feature, properties { ... name: testaddress4 } ... }], 'testaddress4', 'properties.name');
 * //= List containing object with given name.
 */
export default function filterMatchingToInput(list, Input, fields) {
  if (typeof Input === 'string' && Input.length > 0) {
    const input = Input.toLowerCase().trim();
    const multiWord = input.includes(' ') || input.includes(',');

    return list.filter(item => {
      let parts = [];
      fields.forEach(pName => {
        let value = get(item, pName);

        if (
          !multiWord &&
          (pName === 'properties.label' || pName === 'address') &&
          value
        ) {
          // special case: drop last parts i.e. city and neighbourhood
          value = value.split(',');
          if (value.length > 2) {
            value.splice(value.length - 2, 2);
          } else if (value.length > 1) {
            value.splice(value.length - 1, 1);
          }
          value = value.join(',');
        }
        if (value) {
          if (multiWord) {
            parts = parts.concat(value.toLowerCase());
          } else {
            parts = parts.concat(
              value
                .toLowerCase()
                .replace(/,/g, ' ')
                .split(' '),
            );
          }
        }
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(input) === 0) {
          // accept match only at word start
          return true;
        }
      }
      return false;
    });
  }

  return list;
}
