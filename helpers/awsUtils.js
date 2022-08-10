const AWS = require('aws-sdk');
const logger = require('./winston');

const endpoint = process.env.AWS_ENDPOINT;
const bucket = process.env.S3_BUCKET;

const s3 = new AWS.S3({
  endpoint,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const uploadFileToS3 = async (file, filename, type) => {
  await s3
    .upload({
      Bucket: bucket,
      Key: filename,
      Body: file,
      ContentType: type,
    })
    .promise();
  logger.info(`${filename} uploaded`);

  return filename;
};

const downloadFromS3 = (filename) => {
  const url = s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: filename,
  });
  return url;
};
const downloadFromS3 = (filename) => {
  const url = s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: filename,
  });
  return url;
};

module.exports = { uploadFileToS3, downloadFromS3 };
