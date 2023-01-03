import { expect, assert } from 'chai';
import { describe, it } from 'mocha';
import fetchMock from 'fetch-mock';
import {
  FetchError,
  fetchWithErrors,
  retryFetch,
} from '../../../app/util/fetchUtils';

// retryFetch retries fetch requests (url, options, retry count, delay) where total number or calls is initial request + retry count

const testUrl =
  'https://dev-api.digitransit.fi/timetables/v1/hsl/routes/routes.json';

const testJSONResponse = '{"test": 3}';

describe('fetchWithErrors', () => {
  it('on 201, should resolve with the Response', async () => {
    fetchMock.get(testUrl, {
      status: 201,
      body: testJSONResponse,
    });
    try {
      const res = await fetchWithErrors(testUrl);
      expect(res.ok).to.equal(true);
      expect(res.status).to.equal(201);
      expect(res.url).to.equal(testUrl);
      const body = await res.text();
      expect(body).to.equal(testJSONResponse);
    } finally {
      fetchMock.restore();
    }
  });

  it('on 500, should reject with a FetchError', async () => {
    fetchMock.get(testUrl, {
      status: 500,
      body: 'nope',
      headers: { foo: 'bar' },
    });
    try {
      await fetchWithErrors(testUrl);
      expect.fail('should have rejected');
    } catch (err) {
      expect(err).to.be.an.instanceof(FetchError);
      expect(err.name).to.equal('FetchError');
      expect(err.reqUrl).to.equal(testUrl);
      expect(err.res.ok).to.equal(false);
      expect(err.res.status).to.equal(500);
      expect(err.res.url).to.equal(testUrl);
      const body = await err.res.text();
      expect(body).to.equal('nope');
    } finally {
      fetchMock.restore();
    }
  });
});

describe('retryFetch', () => {
  /* eslint-disable no-unused-vars */
  it('fetching something that does not exist with 5 retries should give Not Found error and 6 requests in total should be made ', done => {
    fetchMock.mock(testUrl, 404);
    retryFetch(testUrl, {}, 5, 10)
      .then(res => res.json())
      .then(
        result => {
          assert.fail('Error should have been thrown');
        },
        err => {
          expect(err).to.equal(`${testUrl}: Not Found`);
          // calls has array of requests made to given URL
          const calls = fetchMock.calls(
            'https://dev-api.digitransit.fi/timetables/v1/hsl/routes/routes.json',
          );
          expect(calls.length).to.equal(6);
          fetchMock.restore();
          done();
        },
      );
  });

  it('fetch with larger fetch timeout should take longer', done => {
    let firstEnd;
    let firstDuration;
    const firstStart = performance.now();
    fetchMock.mock(testUrl, 404);
    retryFetch(testUrl, {}, 2, 20)
      .then(res => res.json())
      .then(
        result => {
          assert.fail('Error should have been thrown');
        },
        err => {
          firstEnd = performance.now();
          firstDuration = firstEnd - firstStart;
          expect(firstDuration).to.be.above(40);
          // because test system can be slow, requests should take between 40-200ms (because system can be slow) when retry delay is 20ms and 2 retries
          expect(firstDuration).to.be.below(200);
          fetchMock.restore();
        },
      )
      .then(() => {
        const secondStart = performance.now();
        fetchMock.mock(testUrl, 404);
        retryFetch(testUrl, {}, 2, 100)
          .then(res => res.json())
          .then(
            result => {
              assert.fail('Error should have been thrown');
            },
            err => {
              const secondEnd = performance.now();
              const secondDuration = secondEnd - secondStart;
              expect(secondDuration).to.be.above(200);
              // because test system can be slow, requests should take between 200-360ms when retry delay is 100ms and 2 retries
              expect(firstDuration).to.be.below(360);
              // because of longer delay between requests, the difference between 2 retries with 20ms delay
              // and 2 retries with 100ms delay should be 160ms but because performance slightly varies, there is a 60ms threshold for test failure
              expect(secondDuration - firstDuration).to.be.above(100);
              fetchMock.restore();
              done();
            },
          );
      });
  });

  it('fetch that gives 200 should not be retried', done => {
    fetchMock.get(testUrl, testJSONResponse);
    retryFetch(testUrl, {}, 5, 10)
      .then(res => res.json())
      .then(
        result => {
          // calls has array of requests made to given URL
          const calls = fetchMock.calls(
            'https://dev-api.digitransit.fi/timetables/v1/hsl/routes/routes.json',
          );
          expect(calls.length).to.equal(1);
          fetchMock.restore();
          done();
        },
        err => {
          assert.fail('No error should have been thrown');
        },
      );
  });

  it('fetch that gives 200 should have correct result data', done => {
    fetchMock.get(testUrl, testJSONResponse);
    retryFetch(testUrl, {}, 5, 10)
      .then(res => res.json())
      .then(
        result => {
          expect(result.test).to.equal(3);
          fetchMock.restore();
          done();
        },
        err => {
          assert.fail('No error should have been thrown');
        },
      );
  });
});
