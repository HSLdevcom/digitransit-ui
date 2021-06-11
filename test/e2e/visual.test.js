/* eslint-disable no-undef */
import getConfig from './helpers/image-snapshot-config';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

describe(`Front page with ${config} config`, () => {
  test(`on desktop`, async () => {
    context = await browser.newContext({
      viewport: { width: 1360, height: 768 },
    });
    page = await context.newPage();
    const snapshotName = 'front-page-desktop';
    const response = await page.goto('http://localhost:8080');
    expect(response.status()).toBe(200);

    const mainContent = await page.$('.main-content');
    const image = await mainContent.screenshot({ fullPage: true });

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
    const snapshotName = `front-page-mobile`;
    const response = await page.goto('http://localhost:8080');
    expect(response.status()).toBe(200);

    const messageBarCloseButton = await page.$('#close-message-bar');
    if (messageBarCloseButton) {
      await messageBarCloseButton.click();
    }
    const image = await page.screenshot({ fullPage: true });

    const snapshotConfig = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/${config}/`,
      `${customDiffDir}/${browserName}/${config}/`,
    );
    expect(image).toMatchImageSnapshot(snapshotConfig);
  });
});
