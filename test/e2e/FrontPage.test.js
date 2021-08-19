/* eslint-disable no-undef */
/* eslint-disable compat/compat */
import getConfig from './helpers/image-snapshot-config';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const timeout = 200000;

const platform = (process.env.MOBILE === 'true' && 'mobile') || 'desktop';
const isMobile = platform === 'mobile';

describe(`Front page with ${config} config`, () => {
  const path = config === 'hsl' ? '/etusivu' : '/';
  test(`on ${platform}`, async () => {
    const snapshotName = `front-page-${platform}`;
    const response = await page.goto(`http://localhost:8080${path}`);

    expect(response.status()).toBe(200);

    let image;
    if (!isMobile) {
      const mainContent = await page.$(
        '#mainContent > .desktop > .main-content',
      );
      image = await mainContent.screenshot({
        timeout,
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
