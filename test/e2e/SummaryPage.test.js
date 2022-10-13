/* eslint-disable compat/compat */
/* eslint-disable no-undef */
import fs from 'fs';
import getConfig from './helpers/image-snapshot-config';
import * as MockHelper from './helpers/mock-request-helper';
import summaryPageMockData from './mock-data/SummaryPageQueryResponse.json';
import walkBikeMockData from './mock-data/WalkBikeQueryResponse.json';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const platform = (process.env.MOBILE === 'true' && 'mobile') || 'desktop';
const isMobile = platform === 'mobile';

const mockRoutes = async page => {
  await page.route('**/graphql', async (route, request) => {
    const matched = MockHelper.matchGraphQLRequest(request, [
      {
        matchBody: MockHelper.createPropertyRegex({
          id: 'queryUtils_SummaryPage_Query',
          fromPlace: 'Rautatientori.*',
        }),
        data: summaryPageMockData,
      },
      {
        matchBody: MockHelper.createPropertyRegex({
          id: 'queryUtils_SummaryPage_Query',
          toPlace: 'Valittu sijanti::10,10',
        }),
      },
      {
        matchBody: MockHelper.createPropertyRegex({
          id: 'SummaryPage_WalkBike_Query',
        }),
        data: walkBikeMockData,
      },
    ]);
    if (!matched) {
      return;
    }
    await route.fulfill(MockHelper.buildMockResponse(matched));
  });

  await page.route('https://opendata.fmi.fi/*', async route => {
    const xml = await fs.readFileSync('test/e2e/mock-data/weatherMock.xml');
    await route.fulfill({
      headers: { 'access-control-allow-origin': '*' },
      status: 200,
      contentType: 'text/xml',
      body: xml,
    });
  });
};

/**
 * Encodes URI path from components.
 *
 * @param {Array.<String>} ...args
 * @returns {String}
 */
const encodeComponents = (...args) => args.map(encodeURIComponent).join('/');

describe(`Summary page with ${config} config`, () => {
  beforeEach(async () => {
    await mockRoutes(page);
  });

  describe('normal query', () => {
    const path = encodeComponents(
      'reitti',
      'Rautatientori, Helsinki::60.170384,24.939846',
      'Mannerheimintie 89, Helsinki::60.194445473775644,24.904975891113285',
    );

    test(`itinerary suggestions on ${platform}`, async () => {
      const snapshotName = `itinerary-suggestions-${platform}`;
      const response = await page.goto(`http://localhost:8080/${path}`);

      expect(response.status()).toBe(200);

      await Promise.all([
        page.waitForSelector('.summary-list-container'),
        page.waitForSelector('.street-mode-button-row'),
        page.waitForSelector('.street-mode-selector-weather-container'),
        new Promise(res => setTimeout(res, 2000)),
      ]);

      let image;
      if (!isMobile) {
        const mainContent = await page.$(
          '#app > #mainContent > .desktop > .main-content',
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

    test(`itinerary details on ${platform}`, async () => {
      const snapshotName = `itinerary-details-${platform}`;
      const response = await page.goto(`http://localhost:8080/${path}/2`);

      expect(response.status()).toBe(200);

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
      const image = await mainContent.screenshot({
        fullPage: true,
      });

      const snapshotConfig = getConfig(
        snapshotName,
        `${customSnapshotsDir}/${browserName}/${config}/`,
        `${customDiffDir}/${browserName}/${config}/`,
      );
      expect(image).toMatchImageSnapshot(snapshotConfig);
    });
  });
});
