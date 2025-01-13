/* eslint-disable dot-notation */
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');
const fs = require('fs');

const results = [];

const url = process.argv[2];
if (!url) {
  // eslint-disable-next-line no-console
  console.error('Please provide a URL as a command-line argument.');
  process.exit(1);
}

axios
  .get(url)
  .then(response => {
    const csvStream = new Readable();
    csvStream.push(response.data);
    csvStream.push(null);

    csvStream
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        const mergedLayers = {};

        results.forEach(row => {
          if (!mergedLayers[row['Oberkategorie Code']]) {
            mergedLayers[row['Oberkategorie Code']] = {
              code: row['Oberkategorie Code'],
              translations: {
                de: row['Oberkategorie Deutsch'],
                en: row['Oberkategorie Englisch'],
              },
              categories: [],
            };
          }

          let category = mergedLayers[
            row['Oberkategorie Code']
          ].categories.find(cat => cat.code === row['Kategorie Code']);

          if (!category) {
            category = {
              code: row['Kategorie Code'],
              translations: {
                de: row['Kategorie Deutsch'],
                en: row['Kategorie Englisch'],
              },
              categories: [],
              properties: null,
            };
            mergedLayers[row['Oberkategorie Code']].categories.push(category);
          }

          if (row['Unterkategorie Code']) {
            category.categories.push({
              code: row['Unterkategorie Code'],
              translations: {
                de: row['Unterkategorie Deutsch'],
                en: row['Unterkategorie Englisch'],
              },
              properties: {
                layer: {
                  type: row['Layer-Typ'],
                  url: row['Url'],
                  priority: parseInt(row['Priorisierung bei Überlappung'], 10),
                  min_zoom: parseInt(row['Minimales Zoomlevel'], 10),
                },
                icon: {
                  svg: row['Icon .svg'],
                  origin: row['Herkunft Symbol'],
                  background_color: row['Icon: Farbe Hintergrund_Code'],
                  color: row['Icon: Farbe Symbol'],
                },
                attributes: row['Eigenschaften']
                  .split(',')
                  .map(attr => attr.trim()),
                osm: {
                  filter: row['OSM-Filter'],
                  example: row['Beispielobjekt aus OSM'],
                  wiki: row['OSM-Wiki-Seite'],
                  overpass_query: row['Overpass Query'],
                },
                misc: {
                  comment: row['Kommentar'],
                  origin: row['Herkunft'],
                },
              },
            });
          } else {
            category.properties = {
              layer: {
                type: row['Layer-Typ'],
                url: row['Url'],
                priority: parseInt(row['Priorisierung bei Überlappung'], 10),
                min_zoom: parseInt(row['Minimales Zoomlevel'], 10),
              },
              icon: {
                svg: row['Icon .svg'],
                origin: row['Herkunft Symbol'],
                background_color: row['Icon: Farbe Hintergrund_Code'],
                color: row['Icon: Farbe Symbol'],
              },
              attributes: row['Eigenschaften']
                .split(',')
                .map(attr => attr.trim()),
              osm: {
                filter: row['OSM-Filter'],
                example: row['Beispielobjekt aus OSM'],
                wiki: row['OSM-Wiki-Seite'],
                overpass_query: row['Overpass Query'],
              },
              misc: {
                comment: row['Kommentar'],
                origin: row['Herkunft'],
              },
            };
          }
        });

        // Remove categories property if it's an empty array
        Object.values(mergedLayers).forEach(layer => {
          layer.categories.forEach(category => {
            if (category.categories.length === 0) {
              // eslint-disable-next-line no-param-reassign
              delete category.categories;
            }
          });
        });

        const jsonOutput = Object.values(mergedLayers);

        fs.writeFileSync('layers.json', JSON.stringify(jsonOutput, null, 2));
      });
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error('Error fetching the CSV file:', error.message);
  });
