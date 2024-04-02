const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const connectDB = require('./database.js'); // MongoDB 접근을 위한 모듈

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

module.exports = function(passport) {
    // 로그인 방식 설정
    passport.use(new LocalStrategy(async (username, password, done) => {
        let result = await db.collection('user').findOne({ username: username });
        if (!result) {
            return done(null, false, { message: 1 });
        }
        if (await bcrypt.compare(password, result.password)) {
            return done(null, result);
        } else {
            return done(null, false, { message: 0 });
        }                  
    }));

    // 세션데이터 작성
    passport.serializeUser((user, done) => {
        done(null, { _id: user._id, username: user.username });
    });

    // cookie 까보기
    passport.deserializeUser(async (user, done) => {
        let result = await db.collection('user').findOne({ _id: new ObjectId(user._id) });
        delete result.password;
        done(null, result);
    });
};
