import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import fetchMock from 'fetch-mock';
import oldParamParser from '../../app/util/oldParamParser';

import config from '../../app/configurations/config.default';
import { PREFIX_ITINERARY_SUMMARY } from '../../app/util/path';

const largeMaxAgeConf = {
  ...config,
  queryMaxAgeDays: 100000,
};

const smallMaxAgeConf = {
  ...config,
  queryMaxAgeDays: 1,
};

const query = {
  from_in: 'lapinlahdenkatu 1',
  to_in: 'koivikkotie 10',
  timetype: 'arrival',
  hour: '13',
  minute: '51',
  daymonthyear: '27.09.2018',
  day: '27',
  month: '09',
  year: '2018',
  utm_campaign: 'hsl.fi',
  utm_source: 'etusivu-reittihaku',
  utm_medium: 'referral',
};

const resFrom = {
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [24.932251, 60.166408] },
      properties: {
        id: 'node:301360127',
        gid: 'openstreetmap:address:node:301360127',
        layer: 'address',
        source: 'openstreetmap',
        source_id: 'node:301360127',
        name: 'Lapinlahdenkatu 1a',
        housenumber: '1a',
        street: 'Lapinlahdenkatu',
        postalcode: '00180',
        postalcode_gid: 'whosonfirst:postalcode:421473001',
        confidence: 0.9916400595568646,
        accuracy: 'point',
        country: 'Suomi',
        country_gid: 'whosonfirst:country:85633143',
        country_a: 'FIN',
        region: 'Uusimaa',
        region_gid: 'whosonfirst:region:85683067',
        localadmin: 'Helsinki',
        localadmin_gid: 'whosonfirst:localadmin:907199715',
        locality: 'Helsinki',
        locality_gid: 'whosonfirst:locality:101748417',
        neighbourhood: 'Kamppi',
        neighbourhood_gid: 'whosonfirst:neighbourhood:85898845',
        label: 'Lapinlahdenkatu 1a, Helsinki',
      },
    },
  ],
};

const resTo = {
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [24.930026, 60.225099] },
      properties: {
        id: 'node:633490942',
        gid: 'openstreetmap:address:node:633490942',
        layer: 'address',
        source: 'openstreetmap',
        source_id: 'node:633490942',
        name: 'Koivikkotie 10',
        housenumber: '10',
        street: 'Koivikkotie',
        postalcode: '00630',
        postalcode_gid: 'whosonfirst:postalcode:421473083',
        confidence: 1,
        accuracy: 'point',
        country: 'Suomi',
        country_gid: 'whosonfirst:country:85633143',
        country_a: 'FIN',
        region: 'Uusimaa',
        region_gid: 'whosonfirst:region:85683067',
        localadmin: 'Helsinki',
        localadmin_gid: 'whosonfirst:localadmin:907199715',
        locality: 'Helsinki',
        locality_gid: 'whosonfirst:locality:101748417',
        neighbourhood: 'Maunula',
        neighbourhood_gid: 'whosonfirst:neighbourhood:1108727115',
        label: 'Koivikkotie 10, Helsinki',
      },
    },
  ],
};

// oldParamParser parses old reittiopas format URL, also parses requests coming from hsl.fi

describe('oldParamParser', () => {
  before(() => {
    fetchMock.get(
      'begin:https://dev-api.digitransit.fi/geocoding/v1/search?text=lapinlahdenkatu',
      resFrom,
    );
    fetchMock.get(
      'begin:https://dev-api.digitransit.fi/geocoding/v1/search?text=koivikkotie',
      resTo,
    );
  });

  after(() => {
    fetchMock.restore();
  });

  it('query with all the required parameters and utm parameters should return a valid redirect url with utm params', async () => {
    const url = await oldParamParser(query, largeMaxAgeConf);
    const urlSplit = url.split('/');
    expect(urlSplit[1]).to.equal(PREFIX_ITINERARY_SUMMARY);
    expect(urlSplit[2]).to.equal(
      encodeURIComponent('Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251'),
    );
    expect(urlSplit[3]).to.equal(
      encodeURIComponent('Koivikkotie 10, Helsinki::60.225099,24.930026'),
    );
    const getParams = urlSplit[4].split('&');
    expect(getParams[0].charAt(0)).to.equal('?');
    const timeEpochSeconds = parseInt(getParams[0].substring(6), 10);
    expect(timeEpochSeconds - 1538045460).to.be.lessThan(60);
    expect(getParams[1]).to.equal('arriveBy=true');
    expect(getParams[2]).to.equal('utm_campaign=hsl.fi');
    expect(getParams[3]).to.equal('utm_source=etusivu-reittihaku');
    expect(getParams[4]).to.equal('utm_medium=referral');
    expect(getParams.length).to.equal(5);
  });

  it('query with all the required parameters, utm parameters and time that is older than queryMaxAgeDays should return a valid redirect url with utm params and no time param', async () => {
    const url = await oldParamParser(query, smallMaxAgeConf);
    const urlSplit = url.split('/');
    expect(urlSplit[1]).to.equal(PREFIX_ITINERARY_SUMMARY);
    expect(urlSplit[2]).to.equal(
      encodeURIComponent('Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251'),
    );
    expect(urlSplit[3]).to.equal(
      encodeURIComponent('Koivikkotie 10, Helsinki::60.225099,24.930026'),
    );
    const getParams = urlSplit[4].split('&');
    expect(getParams[0].charAt(0)).to.equal('?');
    expect(getParams[0]).to.equal('?arriveBy=true');
    expect(getParams[1]).to.equal('utm_campaign=hsl.fi');
    expect(getParams[2]).to.equal('utm_source=etusivu-reittihaku');
    expect(getParams[3]).to.equal('utm_medium=referral');
    expect(getParams.length).to.equal(4);
  });

  it('query that has no from_in should return a somewhat valid redirect url', async () => {
    const { from_in, ...queryWithoutFrom } = query; // eslint-disable-line camelcase
    const url = await oldParamParser(queryWithoutFrom, largeMaxAgeConf);
    expect(url).to.equal(
      `/${encodeURIComponent(' ')}/${encodeURIComponent(
        'Koivikkotie 10, Helsinki::60.225099,24.930026',
      )}/?utm_campaign=hsl.fi&utm_source=etusivu-reittihaku&utm_medium=referral`,
    );
  });

  it('query with no time but with utm should return a valid redirect url ', async () => {
    const noTimeQuery = {
      from_in: 'lapinlahdenkatu 1',
      to_in: 'koivikkotie 10',
      utm_campaign: 'hsl.fi',
      utm_source: 'etusivu-reittihaku',
      utm_medium: 'referral',
    };

    const url = await oldParamParser(noTimeQuery, largeMaxAgeConf);
    expect(url).to.equal(
      `/${PREFIX_ITINERARY_SUMMARY}/${encodeURIComponent(
        'Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251',
      )}/${encodeURIComponent(
        'Koivikkotie 10, Helsinki::60.225099,24.930026',
      )}/?utm_campaign=hsl.fi&utm_source=etusivu-reittihaku&utm_medium=referral`,
    );
  });

  it('query with no time or utm should return a valid redirect url ', async () => {
    const { utm_campaign, utm_source, utm_medium, ...queryWithoutUtm } = query; // eslint-disable-line camelcase

    const url = await oldParamParser(queryWithoutUtm, largeMaxAgeConf);
    const urlSplit = url.split('/');
    expect(urlSplit[1]).to.equal(PREFIX_ITINERARY_SUMMARY);
    expect(urlSplit[2]).to.equal(
      encodeURIComponent('Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251'),
    );
    expect(urlSplit[3]).to.equal(
      encodeURIComponent('Koivikkotie 10, Helsinki::60.225099,24.930026'),
    );
    const getParams = urlSplit[4].split('&');
    expect(getParams[0].charAt(0)).to.equal('?');
    const timeEpochSeconds = parseInt(getParams[0].substring(6), 10);
    expect(timeEpochSeconds - 1538045460).to.be.lessThan(60);
    expect(getParams[1]).to.equal('arriveBy=true');
    expect(getParams.length).to.equal(2);
  });

  it('should support a geocoding query that maps to a location containing a forward slash in the name', async () => {
    fetchMock.get(
      'begin:https://dev-api.digitransit.fi/geocoding/v1/search?text=helsinki',
      {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [24.943537, 60.166641] },
            properties: {
              id: 'mml-10342733',
              gid: 'nlsfi:localadmin:mml-10342733',
              layer: 'localadmin',
              source: 'nlsfi',
              source_id: 'mml-10342733',
              name: 'Helsinki',
              confidence: 1,
              accuracy: 'centroid',
              country: 'Suomi',
              country_gid: 'whosonfirst:country:85633143',
              country_a: 'FIN',
              region: 'Uusimaa',
              region_gid: 'whosonfirst:region:mml-01',
              localadmin: 'Helsinki',
              localadmin_gid: 'whosonfirst:localadmin:907199715',
              label: 'Helsinki',
            },
          },
        ],
      },
    );
    fetchMock.get(
      'begin:https://dev-api.digitransit.fi/geocoding/v1/search?text=hyvink',
      {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [25.123135, 60.262989] },
            properties: {
              id: 'node:6068964106',
              gid: 'openstreetmap:venue:node:6068964106',
              layer: 'venue',
              source: 'openstreetmap',
              source_id: 'node:6068964106',
              name: 'Hyvinkään Tieluiska Oy / Vantaan multa-asema',
              housenumber: '2',
              street: 'Pitkäsuontie',
              postalcode: '01230',
              postalcode_gid: 'whosonfirst:postalcode:421473171',
              confidence: 0.9784914678629827,
              accuracy: 'point',
              country: 'Suomi',
              country_gid: 'whosonfirst:country:0',
              country_a: 'FIN',
              region: 'Uusimaa',
              region_gid: 'whosonfirst:region:85683067',
              localadmin: 'Vantaa',
              localadmin_gid: 'whosonfirst:localadmin:907199651',
              locality: 'Vantaa',
              locality_gid: 'whosonfirst:locality:101748419',
              neighbourhood: 'Ojanko',
              neighbourhood_gid: 'whosonfirst:neighbourhood:1108729583',
              label:
                'Hyvinkään Tieluiska Oy / Vantaan multa-asema, Pitkäsuontie 2, Vantaa',
            },
          },
        ],
      },
    );

    const parsed = {};
    'from_in=helsinki&to_in=hyvink%C3%A4%C3%A4n+tieluiska+oy&when=now&timetype=departure&hour=17&minute=16&daymonthyear=04.02.2019&form_build_id=form-AFAE3Ci2MXVz7Loycg1cCwHRXwyqK7khptNHOokCVT8&form_id=reittiopas_search_form&day=04&month=02&year=2019'
      .split('&')
      .map(s => s.split('='))
      .forEach(kvp => {
        const key = kvp[0];
        const value = kvp[1];
        parsed[key] = value;
      });

    const result = await oldParamParser(parsed, config);
    expect(result).to.equal(
      `/${PREFIX_ITINERARY_SUMMARY}/Helsinki%3A%3A60.166641%2C24.943537/Hyvink%C3%A4%C3%A4n%20Tieluiska%20Oy%20%2F%20Vantaan%20multa-asema%2C%20Pitk%C3%A4suontie%202%2C%20Vantaa%3A%3A60.262989%2C25.123135/`,
    );
  });
});
