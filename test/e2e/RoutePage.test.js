/* eslint-disable compat/compat */
/* eslint-disable no-undef */
import RoutePagePatternMockData from './mock-data/RoutePagePatternQueryResponse.json';
import RoutePageBatchMockData from './mock-data/RoutePageBatchQueryResponse.json';
import RoutePageBatchTampereMockData from './mock-data/RoutePageBatchTampereResponse.json';
import RoutePageBatchFuzzyTrips from './mock-data/RoutePageBatchFuzzyTripsQueryResponse.json';
import RoutePageStopListMockData from './mock-data/RoutePageStopListQueryResponse.json';
import getConfig from './helpers/image-snapshot-config';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const platform = (process.env.MOBILE === 'true' && 'mobile') || 'desktop';
const isMobile = platform === 'mobile';

const mockRoutes = async page => {
  await page.route('**/index/graphql/batch', async (route, request) => {
    if (request.method() === 'POST') {
      if (request.postData().includes('routeRoutes_RoutePage_Query')) {
        const mockData =
          config === 'tampere'
            ? RoutePageBatchTampereMockData
            : RoutePageBatchMockData;
        await route.fulfill({
          headers: { 'access-control-allow-origin': '*' },
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData),
        });
      }
      if (request.postData().includes('FuzzyTripLinkQuery')) {
        await route.fulfill({
          headers: { 'access-control-allow-origin': '*' },
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(RoutePageBatchFuzzyTrips),
        });
      }
    }
  });
  await page.route('**/index/graphql', async (route, request) => {
    if (request.method() === 'POST') {
      if (
        request.postData().includes('RoutePatternSelect_similarRoutesQuery')
      ) {
        await route.fulfill({
          headers: { 'access-control-allow-origin': '*' },
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(RoutePagePatternMockData),
        });
      }
      if (request.postData().includes('RouteStopListContainerQuery')) {
        await route.fulfill({
          headers: { 'access-control-allow-origin': '*' },
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(RoutePageStopListMockData),
        });
      }
    }
  });
};

describe(`Route page with ${config} config`, () => {
  beforeEach(async () => {
    await mockRoutes(page);
  });
  const paths = {
    hsl: '/linjat/HSL:1052/pysakit/HSL:1052:0:01',
    tampere: '/linjat/tampere:79B47374/pysakit/tampere:79B47374:0:02',
    matka: '/linjat/HSL:1052/pysakit/HSL:1052:0:01',
  };
  test(`stop list on ${platform}`, async () => {
    const snapshotName = `route-page-stop-list-${platform}`;
    const response = await page.goto(`http://localhost:8080${paths[config]}`);

    expect(response.status()).toBe(200);
    // await new Promise(res => setTimeout(res, 2000000));
    await page.waitForSelector('.route-stop-list');
    const snapshotConfig = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/${config}/`,
      `${customDiffDir}/${browserName}/${config}/`,
    );
    let mainContent;
    if (!isMobile) {
      await page.waitForSelector(
        '#mainContent > .desktop > .main-content > .scrollable-content-wrapper',
      );
      mainContent = await page.$('#mainContent > .desktop > .main-content');
    } else {
      await page.waitForSelector(
        '#app > #mainContent > .mobile > .drawer-container > .drawer-content',
      );
      mainContent = await page.$(
        '#app > #mainContent > .mobile > .drawer-container > .drawer-content',
      );
    }
    const image = await mainContent.screenshot();
    expect(image).toMatchImageSnapshot(snapshotConfig);
  });
});
