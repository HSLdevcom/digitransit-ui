/* eslint-disable no-undef */
import getConfig from './helpers/image-snapshot-config';

const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

describe('Frontpage', () => {
  it(`Desktop visual regression`, async () => {
    const snapshotName = 'front-page';
    const response = await page.goto('http://localhost:8080/etusivu');
    expect(response.status()).toBe(200);

    await expect(page.title()).resolves.toMatch('Reittiopas');

    const mainContent = await page.$('.main-content');
    const image = await mainContent.screenshot({ fullPage: true });

    const config = getConfig(
      snapshotName,
      `${customSnapshotsDir}/${browserName}/`,
      `${customDiffDir}/${browserName}/`,
    );
    expect(image).toMatchImageSnapshot(config);
  });
});
