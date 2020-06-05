// Get hidden keys for bucket in our .env file
require("dotenv").config({ path: "../.env" });
const bluebird = require("bluebird");

const AWS = require("aws-sdk");

const bucket = process.env.S3_BUCKET;
const accessKey = process.env.S3_KEY;
const secret = process.env.S3_SECRET;

AWS.config.update({
  accessKeyId: accessKey,
  secretAccessKey: secret
});

AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3();

// Upload to S3 bucket in promise format
const upload = (buffer, name, type) => {
  console.log("inside upload");
  const params = {
    ACL: "public-read",
    Body: buffer,
    Bucket: bucket,
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
  };
  return s3.upload(params).promise();
};

module.exports = {
  upload
};
