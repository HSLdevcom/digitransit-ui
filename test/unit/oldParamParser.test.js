import { expect } from 'chai';
import { after, before, describe, it } from 'mocha';
import fetchMock from 'fetch-mock';
import oldParamParser from '../../app/util/oldParamParser';

import config from '../../app/configurations/config.default';

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

  it('query with all the required parameters should return a valid redirect url', done => {
    oldParamParser(query, largeMaxAgeConf).then(url => {
      const urlSplit = url.split('/');
      expect(urlSplit[1]).to.equal('reitti');
      expect(urlSplit[2]).to.equal(
        'Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251',
      );
      expect(urlSplit[3]).to.equal(
        'Koivikkotie 10, Helsinki::60.225099,24.930026',
      );
      const getParams = urlSplit[4].split('&');
      expect(getParams[0].charAt(0)).to.equal('?');
      const timeEpochSeconds = parseInt(getParams[0].substring(7), 10);
      expect(timeEpochSeconds - 1538045460).to.be.lessThan(60);
      expect(getParams[1]).to.equal('arriveBy=true');
      done();
    });
  });

  it('query with all the required parameters and utm parameters should return a valid redirect url with utm params', done => {
    oldParamParser(query, largeMaxAgeConf).then(url => {
      const urlSplit = url.split('/');
      expect(urlSplit[1]).to.equal('reitti');
      expect(urlSplit[2]).to.equal(
        'Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251',
      );
      expect(urlSplit[3]).to.equal(
        'Koivikkotie 10, Helsinki::60.225099,24.930026',
      );
      const getParams = urlSplit[4].split('&');
      expect(getParams[0].charAt(0)).to.equal('?');
      const timeEpochSeconds = parseInt(getParams[0].substring(7), 10);
      expect(timeEpochSeconds - 1538045460).to.be.lessThan(60);
      expect(getParams[1]).to.equal('arriveBy=true');
      expect(getParams[2]).to.equal('utm_campaign=hsl.fi');
      expect(getParams[3]).to.equal('utm_source=etusivu-reittihaku');
      expect(getParams[4]).to.equal('utm_medium=referral');
      done();
    });
  });

  it('query with all the required parameters, utm parameters and time that is older than queryMaxAgeDays should return a valid redirect url with utm params and no time param', done => {
    oldParamParser(query, smallMaxAgeConf).then(url => {
      const urlSplit = url.split('/');
      expect(urlSplit[1]).to.equal('reitti');
      expect(urlSplit[2]).to.equal(
        'Lapinlahdenkatu 1a, Helsinki::60.166408,24.932251',
      );
      expect(urlSplit[3]).to.equal(
        'Koivikkotie 10, Helsinki::60.225099,24.930026',
      );
      const getParams = urlSplit[4].split('&');
      expect(getParams[0].charAt(0)).to.equal('?');
      expect(getParams[0]).to.equal('?arriveBy=true');
      expect(getParams[1]).to.equal('utm_campaign=hsl.fi');
      expect(getParams[2]).to.equal('utm_source=etusivu-reittihaku');
      expect(getParams[3]).to.equal('utm_medium=referral');
      done();
    });
  });

  it('query that has no from_in should return a somewhat valid redirect url', done => {
    const { from_in, ...queryWithoutFrom } = query; // eslint-disable-line camelcase
    oldParamParser(queryWithoutFrom, largeMaxAgeConf).then(url => {
      expect(url).to.equal(
        '/ /Koivikkotie 10, Helsinki::60.225099,24.930026/?utm_campaign=hsl.fi&utm_source=etusivu-reittihaku&utm_medium=referral',
      );
      done();
    });
  });
});
