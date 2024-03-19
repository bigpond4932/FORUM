const EnvConfig = require('dotenv').config(); 

// 파일업로드 -> AWS S3 이용
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
    region: 'ap-northeast-1',
    credentials: {
        accessKeyId: EnvConfig.parsed.AWS_ACCESS_KEY,
        secretAccessKey: EnvConfig.parsed.AWS_ACCESS_SECRETKEY
    }
}, (s3) => {
    console.log(s3);
})

// multer 라이브러리
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'aws-bucket-hongyt',
        key: function (req, file, cb) {
            console.log('upload start');
            console.log(req.file);
            console.log(file);
            cb(null, Date.now().toString()) //업로드시 파일명 변경가능
            console.log('upload end');
        }
    })
})

module.exports = upload