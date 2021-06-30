/* eslint-disable no-undef */
import fs from 'fs';
import getConfig from './helpers/image-snapshot-config';
import summaryPageMockData from './mock-data/SummaryPageQueryResponse.json';
import walkBikeMockData from './mock-data/WalkBikeQueryResponse.json';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const platform = (process.env.MOBILE === 'true' && 'mobile') || 'desktop';
const isMobile = platform === 'mobile';

const mockRoutes = async page => {
  await page.route('**/graphql', async (route, request) => {
    if (
      request.postData().includes('queryUtils_SummaryPage_Query') &&
      request.method() === 'POST'
    ) {
      await route.fulfill({
        headers: { 'access-control-allow-origin': '*' },
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(summaryPageMockData),
      });
    }
    if (
      request.postData().includes('SummaryPage_WalkBike_Query') &&
      request.method() === 'POST'
    ) {
      await route.fulfill({
        headers: { 'access-control-allow-origin': '*' },
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(walkBikeMockData),
      });
    }
  });

  await page.route('**/wfs', async route => {
    const xml = await fs.readFileSync('test/e2e/mock-data/weatherMock.xml');
    await route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      status: 200,
      contentType: 'text/xml',
      body: xml,
    });
  });
};

describe(`Summary page with ${config} config`, () => {
  beforeEach(async () => {
    await mockRoutes(page);
  });
  const path =
    '/reitti/Rautatientori%2C%20Helsinki%3A%3A60.170384%2C24.939846/Mannerheimintie%2089%2C%20Helsinki%3A%3A60.194445473775644%2C24.904975891113285?locale=fi&time=1624975569/';
  test(`itinerary suggestions on ${platform}`, async () => {
    const snapshotName = `summary-page-${platform}`;
    const response = await page.goto(`http://localhost:8080${path}`);
    await Promise.all([
      page.waitForSelector('.summary-list-container'),
      page.waitForSelector('.street-mode-button-row'),
      new Promise(res => setTimeout(res, 2000)),
    ]);

    expect(response.status()).toBe(200);
    await expect(page.title()).resolves.toMatch('Reittiehdotukset');

    let image;
    if (!isMobile) {
      const mainContent = await page.$(
        '#mainContent > .desktop > .main-content',
      );
      image = await mainContent.screenshot({
        fullPage: true,
      });
    } else {
      image = await page.screenshot({ fullPage: true });
    }

    const snapshotConfig = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/${config}/`,
      `${customDiffDir}/${browserName}/${config}/`,
    );
    expect(image).toMatchImageSnapshot(snapshotConfig);
  });
});
