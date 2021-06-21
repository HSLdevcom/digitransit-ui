/* eslint-disable no-undef */
import getConfig from './helpers/image-snapshot-config';

const config = process.env.CONFIG || 'hsl';
const customSnapshotsDir = `test/e2e/__image_snapshots__`;
const customDiffDir = `test/e2e/__image_snapshots__/__diff_output__`;

const timeout = 200000;

const pageTitles = {
  hsl: 'Reittiopas',
  tampere: 'Nyssen reittiopas',
  matka: 'Matka.fi',
};

const platform = (process.env.MOBILE === 'true' && 'mobile') || 'desktop';
const isMobile = platform === 'mobile';

describe(`Front page with ${config} config`, () => {
  const path = config === 'hsl' ? '/etusivu' : '/';
  test(`on ${platform}`, async () => {
    const snapshotName = `front-page-${platform}`;
    const response = await page.goto(`http://localhost:8080${path}`);

    expect(response.status()).toBe(200);
    await expect(page.title()).resolves.toMatch(pageTitles[config]);

    let mainContent;
    if (!isMobile) {
      mainContent = await page.$('#mainContent > .desktop > .main-content');
    } else {
      mainContent = await page.$('#mainContent > .mobile');
    }

    const image = await mainContent.screenshot({
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
