/* eslint-disable */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

const containerName = `diff-images`;
const sasToken = process.env.STORAGESASTOKEN;
const storageAccountName = process.env.STORAGERESOURCENAME;
const github_ref = process.env.REF;
const blobUrl = `https://${storageAccountName}.blob.core.windows.net`;

const isStorageConfigured = () => {
  return !(!storageAccountName || !sasToken);
};

const createBlobInContainer = async (containerClient, file, fileOptions) => {
  const blobClient = containerClient.getBlockBlobClient(fileOptions.name);
  const options = { blobHTTPHeaders: { blobContentType: fileOptions.type } };

  await blobClient.uploadData(file, options);
};

const uploadFileToBlob = async (file, options, callback) => {
  if (!file) {
    return;
  }

  const blobService = new BlobServiceClient(`${blobUrl}/?${sasToken}`);
  const containerClient = blobService.getContainerClient(containerName);
  await containerClient.createIfNotExists({
    access: 'container',
  });
  await createBlobInContainer(containerClient, file, options);
  callback();
};

class ImageReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const storageConfigured = isStorageConfigured();
    if (
      storageConfigured &&
      results.numFailedTests > 0
    ) {
      const basePath = path.join(
        path.resolve(),
        '/test/e2e/__image_snapshots__/__diff_output__',
      );
      const browsers = fs.readdirSync(basePath);
      browsers.forEach(browser => {
        const configs = fs.readdirSync(`${basePath}/${browser}`);
        configs.forEach(config => {
          const images = fs.readdirSync(`${basePath}/${browser}/${config}`);
          images.forEach(img => {
            const file = fs.readFileSync(
              `${basePath}/${browser}/${config}/${img}`,
            );
            const name = `${github_ref}-${browser}-${config}-${img}`;
            const options = {
              name,
              type: 'image/png',
            };
            uploadFileToBlob(file, options, () => {
              console.log(
                `Uploaded image diff file to ${blobUrl}/${containerName}/${name}`,
              );
            });
          });
        });
      });
    }
  }
}

module.exports = ImageReporter;
