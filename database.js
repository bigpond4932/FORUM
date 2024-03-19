// server.js로 export

const { MongoClient } = require('mongodb');
const EnvConfig = require('dotenv').config(); // dotenv 패키지를 사용해 .env 파일 로드
const url = EnvConfig.parsed.DATABASE_URL;
let connectDB = new MongoClient(url).connect();

module.exports = connectDB