const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { extractS3FolderName } = require('../utils/helper');

const BUCKET = 'jr-cms';

aws.config.update({
  // Your SECRET ACCESS KEY from AWS should go here,
  // Never share it!
  // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
  secretAccessKey: process.env.S3_KEY,
  // Not working key, Your ACCESS KEY ID from AWS should go here,
  // Never share it!
  // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
  accessKeyId: process.env.S3_ID,
  region: 'ap-southeast-2' // region of your bucket
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb({ name: 'MulterError', message: 'Only support jpeg image' });
  }
};

const uploadImage = (key, fieldName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: BUCKET,
      key: (req, file, cb) => {
        cb(null, `${extractS3FolderName(req.baseUrl)}/${req.params[key]}.jpeg`);
      }
    }),
    limits: {
      fileSize: 1024 * 1024
    },
    fileFilter
  }).single(fieldName);

const deleteImage = key =>
  new Promise((res, rej) => {
    s3.deleteObject({ Bucket: BUCKET, Key: key }, (err, data) => {
      if (err) rej(err);
      res(data);
    });
  });

const checkResourceExist = key =>
  new Promise(res => {
    s3.headObject({ Bucket: BUCKET, Key: key }, err =>
      err ? res(false) : res(true)
    );
  });

module.exports = {
  uploadImage,
  deleteImage,
  checkResourceExist
};
