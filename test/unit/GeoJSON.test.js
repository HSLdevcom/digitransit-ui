import { expect } from 'chai';
import { describe, it } from 'mocha';
import { MapJSON } from '../../app/component/map/MapWithTracking';

describe('GeoJSON interface', () => {
  it('can map custom properties to known properties', () => {
    const geoJsonSource = [
      {
        name: {
          en: 'external map data source',
        },
        url: '/home.com',
        metadata: {
          // renders point as a plain text element if 'tekstielementti' contains a string
          textOnly: 'tekstielementti',
          // the visible label comes from 'tekstielementti' too
          name: 'tekstielementti',
          // add a popup if feature has 'tiedot'
          popupContent: 'tiedot',
        },
      },
    ];

    const geoJsonResponse = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            tekstielementti: 'this-text-is-visible',
          },
          geometry: {
            type: 'Point',
            coordinates: [24, 60],
          },
        },
        {
          type: 'Feature',
          properties: {
            tiedot: 'ponnahdusvalikko',
          },
          geometry: {
            type: 'Point',
            coordinates: [24.5, 60.1],
          },
        },
      ],
    };
    MapJSON(geoJsonResponse, geoJsonSource[0].metadata);
    const p0 = geoJsonResponse.features[0].properties;
    const p1 = geoJsonResponse.features[1].properties;

    expect(p0.textOnly).to.equal('this-text-is-visible');
    expect(p0.name).to.equal('this-text-is-visible');
    expect(p1.popupContent).to.equal('ponnahdusvalikko');
  });
});
