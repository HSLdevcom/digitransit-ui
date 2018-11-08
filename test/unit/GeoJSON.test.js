import { expect } from 'chai';
import { describe, it } from 'mocha';
import { MapJSON, styleFeatures } from '../../app/store/GeoJsonStore';

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

  it('should duplicate features with different style properties if the original feature has a styles array', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        {
          geometry: {
            coordinates: [[1, 1], [2, 2], [3, 3], [4, 4]],
            type: 'LineString',
          },
          styles: [
            {
              color: 'black',
              weight: 1,
            },
            {
              color: 'gray',
              weight: 5,
            },
          ],
          type: 'Feature',
        },
        {
          style: {
            color: 'green',
            weight: 4,
          },
        },
      ],
    };

    const output = styleFeatures(input);
    expect(output).to.not.equal(input);
    expect(output.features.length).to.equal(3);
    expect(output.features.filter(feature => feature.styles)).to.have.lengthOf(
      0,
    );
    expect(output.features[0].geometry).to.deep.equal(
      output.features[1].geometry,
    );
    expect(output.features[0].style).to.deep.equal({
      color: 'black',
      weight: 1,
    });
    expect(output.features[1].style).to.deep.equal({
      color: 'gray',
      weight: 5,
    });
    expect(output.features[0]).to.not.equal(output.features[1]);
  });

  it('should return the same array if no styles exist', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        {
          style: {
            color: 'green',
            weight: 4,
          },
        },
      ],
    };
    const output = styleFeatures(input);
    expect(output).to.equal(input);
  });
});
