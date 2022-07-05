const AWS = require('aws-sdk');

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
  console.log(`${filename} uploaded`);

  const url = s3.getSignedUrl('getObject', {
    Bucket: bucket,
    Key: filename,
  });
  return url;
};

module.exports = { uploadFileToS3 };
