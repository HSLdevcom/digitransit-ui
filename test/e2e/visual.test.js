/* eslint-disable no-undef */
import getConfig from './helpers/image-snapshot-config';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const timeout = 200000;

describe(`Front page with ${config} config`, () => {
  test(`on desktop`, async () => {
    context = await browser.newContext({
      viewport: { width: 1360, height: 768 },
    });
    const path = config === 'hsl' ? '/etusivu' : '/';
    page = await context.newPage();
    const snapshotName = 'front-page-desktop';
    const response = await page.goto(`http://localhost:8080${path}`);
    expect(response.status()).toBe(200);

    const mainContent = await page.$('.main-content');
    const image = await mainContent.screenshot({
      fullPage: true,
      visible: true,
      timeout,
    });

    const snapshotConfig = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/${config}/`,
      `${customDiffDir}/${browserName}/${config}/`,
    );
    expect(image).toMatchImageSnapshot(snapshotConfig);
  });

  test('on mobile', async () => {
    context = await browser.newContext({
      viewport: { width: 414, height: 715 }, // iPhone 11 viewport sizes
    });
    page = await context.newPage();
    const path = config === 'hsl' ? '/etusivu' : '/';
    const snapshotName = `front-page-mobile`;
    const response = await page.goto(`http://localhost:8080${path}`);
    expect(response.status()).toBe(200);

    const messageBarCloseButton = await page.$('#close-message-bar');
    if (messageBarCloseButton) {
      await messageBarCloseButton.click();
    }
    const image = await page.screenshot({
      fullPage: true,
      visible: true,
      timeout,
    });

    const snapshotConfig = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/${config}/`,
      `${customDiffDir}/${browserName}/${config}/`,
    );
    expect(image).toMatchImageSnapshot(snapshotConfig);
  });
});
