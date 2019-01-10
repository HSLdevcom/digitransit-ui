import { expect, assert } from 'chai';
import { describe, it } from 'mocha';
import fetchMock from 'fetch-mock';
import { retryFetch } from '../../../app/util/fetchUtils';

// retryFetch retries fetch requests (url, options, retry count, delay) where total number or calls is initial request + retry count

const testUrl =
  'https://dev-api.digitransit.fi/timetables/v1/hsl/routes/routes.json';

const testJSONResponse = '{"test": 3}';

describe('retryFetch', () => {
  /* eslint-disable no-unused-vars */
  it('fetching something that does not exist with 5 retries should give Not Found error and 6 requests in total should be made ', done => {
    fetchMock.mock(testUrl, 404);
    retryFetch(testUrl, {}, 5, 200)
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
    retryFetch(testUrl, {}, 2, 50)
      .then(res => res.json())
      .then(
        result => {
          assert.fail('Error should have been thrown');
        },
        err => {
          firstEnd = performance.now();
          firstDuration = firstEnd - firstStart;
          expect(firstDuration).to.be.above(100);
          // because test system can be slow, requests should take between 100-200ms when retry delay is 50ms and 2 retries
          expect(firstDuration).to.be.below(200);
          fetchMock.restore();
        },
      )
      .then(() => {
        const secondStart = performance.now();
        fetchMock.mock(testUrl, 404);
        retryFetch(testUrl, {}, 2, 300)
          .then(res => res.json())
          .then(
            result => {
              assert.fail('Error should have been thrown');
            },
            err => {
              const secondEnd = performance.now();
              const secondDuration = secondEnd - secondStart;
              expect(secondDuration).to.be.above(600);
              // because test system can be slow, requests should take between 600-800ms when retry delay is 300ms and 2 retries
              expect(firstDuration).to.be.below(800);
              // because of longer delay between requests, the difference between 2 retries with 50ms delay
              // and 2 retries with 300ms delay should be 500 but because performance slightly varies, there is a 50ms threshold for test failure
              expect(secondDuration - firstDuration).to.be.above(450);
              fetchMock.restore();
              done();
            },
          );
      });
  });

  it('fetch that gives 200 should not be retried', done => {
    fetchMock.get(testUrl, testJSONResponse);
    retryFetch(testUrl, {}, 5, 200)
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
    retryFetch(testUrl, {}, 5, 200)
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
