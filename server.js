const express = require('express');
// 예시: Node.js 코드에서 환경 변수 사용
const app = express();
const passport = require('passport');
app.use(express.json()); // JSON형식으 데이터를 파싱하려면 필요하구나.
const path = require('path');
const passportConfig = require('./passport-config.js')(passport); // Passport 설정 로드

// 보안을 위해 설정들은 .env파일에서 변수로 가져다 쓰기
const EnvConfig = require('dotenv').config(); // dotenv 패키지를 사용해 .env 파일 로드
const url = EnvConfig.parsed.DATABASE_URL;

// mongoDB
const MongoStore = require('connect-mongo');

// passport 라이브러리를 이용한 간단한 로그인 구현
const session = require('express-session')

// 암호화 모듈
const bcrypt = require('bcrypt')

// 미들웨어 설정
app.use(express.urlencoded({ extended: true })); // form-data를 처리하기 위한 설정
app.use(express.static(__dirname + '/public')); // static 파일은 public 하위폴더에서 가져가라 -> html에 main.css작성했더니 뭐 이상하게 라우팅을 해주더라..
app.set('view engine', 'ejs'); // ejs 사용을 위한 세팅

app.use(passport.initialize())
app.use(session({
    secret: EnvConfig.parsed.SECRET_KEY, // 암호화에 쓸 서버의 비밀번호 
    resave: false, // 매번 세션 데이터 갱신 할거니?
    saveUninitialized: false, // 로그인 안해도 세션 만들거임?
    cookie: { maxAge: 60 * 60 * 1000 },
    store: MongoStore.create({ // 세션정보를 db에서 관리하게끔 변경
        mongoUrl: url,
        dbName: 'forum'
    })
}))

// passport 라이브러리의 세션 사용 선언
app.use(passport.session())

// db 커넥션 획득 & 포트 기동 (서비스 개시)
let db
let connectDB = require('./database.js');
connectDB.then((client) => { // Collection 커넥션을 획득
    console.log('DB연결성공')
    db = client.db('forum') // forum db
    app.listen(8080, (req, res) => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })
}).catch((err) => {
    console.log(err)
})

// 메인페이지
app.get('/', (req, resp) => {
    return resp.render('index.ejs') // 비밀번호 입력 필요 없는데..
})
app.use('/fortune', require('./routes/fortune.js'));

// 로그인 라우팅
// public js 파일 이름이랑 route용 파일 이름이 겹치네 이거 해결해야하나? 
app.use('/login', require('./routes/login.js'))

// 회원가입 관련 라우터
app.use('/register', require('./routes/register.js'));

// register & login 기능 제외 로그인 체크 대상
app.use(loginCheck);

// 글 작성 & 수정
app.use('/write', require('./routes/write.js'))

// 글목록 기능
app.use('/list', require('./routes/list.js'))

// list 조회시 타임 스탬프를 찍게 하는 미들웨어
app.use('/list', whoGetList)

// 글 조회
app.use('/articles', require('./routes/detail.js'))

// 마이페이지 조회
app.get('/mypage', (req, resp) => {
    resp.render('mypage.ejs', { user: req.user });
})

// middleware
function loginCheck(req, resp, next) {
    if (req.user == null) {
        return resp.redirect('/login'); // 리다이렉트 후 함수 실행을 중단합니다.
    }
    next(); // 사용자가 로그인 상태일 때만 다음 미들웨어로 넘어갑니다.
}

function whoGetList(req, resp, next) {
    console.log(req.method);
    if (req.method == 'GET') {
        console.log(`${req.user.username} get List ${new Date()}`);
    }
    next()
}


// 숙제
// "/" 를 추가를 해야되나 말아야하나 -> 추가 안해야 잘 작동한다.
// loginCheck를 미들웨어로 반드시 넣어야 할까?.. 위에서 app.use(loginCheck);를 선언했지만
// 미들웨어로 loginCheck를 추가하지 않는 한 /board 경로에 대해 로그인 체크를 하지 않네?
app.use('/board', loginCheck, require('./routes/board.js'));