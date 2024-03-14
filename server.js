const express = require('express');
// 예시: Node.js 코드에서 환경 변수 사용
const app = express();
const EnvConfig = require('dotenv').config(); // dotenv 패키지를 사용해 .env 파일 로드
const { ObjectId } = require('mongodb');
const { MongoClient } = require('mongodb');

// passport 라이브러리를 이용한 간단한 로그인 구현
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

// 암호화 모듈
const bcrypt = require('bcrypt')

app.use(express.urlencoded({ extended: true })); // form-data를 처리하기 위한 설정
app.use(express.static(__dirname + '/public')); // static 파일은 public 하위폴더에서 가져가라 -> html에 main.css작성했더니 뭐 이상하게 라우팅을 해주더라..
app.set('view engine', 'ejs'); // ejs 사용을 위한 세팅

app.use(passport.initialize())
app.use(session({
    secret: EnvConfig.parsed.SECRET_KEY, // 암호화에 쓸 서버의 비밀번호 
    resave: false, // 매번 세션 데이터 갱신 할거니?
    saveUninitialized: false, // 로그인 안해도 세션 만들거임?
    cookie: { maxAge: 60 * 60 * 1000 }
}))

app.use(passport.session())

passport.use(new LocalStrategy(async (username, password, cb) => {
    let result = await db.collection('user').findOne({ username: username })
    if (!result) {
        return cb(null, false, { message: '아이디 DB에 없음' })
    }
    if (await bcrypt.compare(password, result.password)) {
        return cb(null, result);
    } else {
        return cb(null, false, { message: '비밀번호 불일치' })
    }
}))

// 세션작성
passport.serializeUser((user, done) => {
    console.log(user); // cb(callback function) result가 user
    process.nextTick(() => { // 내부 코드를 비동기적으로 처리해줌 timer.at() 비슷함
        done(null, { _id: user._id, username: user.username }); // make session document and send cookie
    })
});

// cookie 까보기
passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: new ObjectId(user._id) })
    delete result.password
    process.nextTick(() => { // 내부 코드를 비동기적으로 처리해줌 timer.at() 비슷함
        done(null, result)
    })
});

let db
// 보안을 위해 설정들은 .env파일에서 변수로 가져다 쓰기
const url = EnvConfig.parsed.DATABASE_URL;
// console.log(url);
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('forum')
    app.listen(8080, (req, res) => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })
}).catch((err) => {
    console.log(err)
})
// 가입기능
app.get('/register', (req, resp) => {
    resp.render('register.ejs');
})
app.post('/register', async (req, resp) => {
    // id 중복을 일단 체크를 해야되겠고
    var username = req.body.username
    var password = await bcrypt.hash(req.body.password, 10)
    console.log(password);
    try {
        if (username != '' && password != '') {
            let found = await db.collection('user').findOne({ username: username })
            console.log(found);
            // // id 유효성 검사.. 비밀번호 유요성 검사.. pass
            if (found) { // object가 들어가도 if쪽으로 갈까? 간다.
                console.log('중복');
                // 사용자에게 너 중복됐다고 알려주고 싶어
                return resp.redirect('/login?register=false');
            } else {
                console.log('중복 아님');
                // 중복 아이디 없음 -> 가입시켜 -> 가입성공을 알려줘 -> login페이지로 전이 
                var result = await db.collection('user').insertOne({
                    username: username,
                    password: password
                })
                if (result.acknowledged) {
                    // 가입성공
                    return resp.redirect('/login?register=true');
                }
            }
        }
        // 그러나 주의할 점은, 이러한 응답 메소드 후에 명시적으로 return을 사용하지 않는 경우, 
        // 라우트 핸들러 내의 그 다음 코드가 계속 실행될 수 있음을 의미합니다. 
    } catch (err) {
        return resp.status(500).json({
            error: {
                message: err
            }
        });
    }
})
app.get('/duplicate/:targetId', async (req, resp) => {
    let found = await db.collection('user').findOne({ username: req.params.targetId })
    if (found == null) {
        resp.send({ result: true })
    } else {
        resp.send({ result: false })
    }
})

// 로그인 페이지 보여주기
app.get('/login', (req, resp) => {
    // console.log(req.user);
    resp.render('login.ejs');
})

app.post('/login', async (req, resp, next) => {
    passport.authenticate('local', (error, user, info) => {
        console.log(error);
        console.debug(user);
        console.log(info);
        if (error) return resp.status(500).json(error)
        if (!user) return resp.status(401).json(info.message)
        req.logIn(user, (err) => {
            if (err) return next(err)
            resp.redirect('/')
        })
    })(req, resp, next) // 얘네 없으면 동작 안하네?..
})


app.post('/save', async (req, resp) => {
    var body = req.body;
    var title = body.title;
    var content = body.content;
    var id = body.id;
    // console.log(title, content, id);
    try {
        // Create a filter for _id is id
        const filter = { _id: new ObjectId(id) };
        /* Set the upsert option to insert a document if no documents match
        the filter */
        const options = { upsert: false };
        // write update doc
        const updateDoc = {
            $set: {
                title: title,
                content: content
            },
        };
        // Update the first document that matches the filter
        const result = await db.collection('post').updateOne(filter, updateDoc, options);

        // Print the number of matching and modified documents
        console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        );
        resp.redirect(`/articles/${id}`);
    } catch (error) {
        resp.status(500).send('fail to update data')
    }
    // finally{
    //     await client.close();
    // }
})

app.get('/', (req, resp) => {
    resp.render('index.ejs')
})
// 글작성/읽기 과제
app.get('/write', (req, resp) => {
    resp.render('write.ejs')
})

app.post('/write', async (req, resp) => { // async가 없으면 
    var body = req.body;
    var title = body.title;
    var content = body.content;
    console.log(title, content); // req-body parser가 필요하다.
    if (title == '') {
        resp.send('title을 입력해주세요');
    } else {
        try {
            // 요청부분을 받기 -> 필요한 부분 몽고디비에 저장하기
            var result = await db.collection('post').insertOne({ title: title, content: content });
            if (result.acknowledged) {
                resp.redirect(`/articles/${result.insertedId}`);
            } else {
                resp.status(500).send('DB connection failed');
            }
        } catch (e) {
            console.log(e);
            resp.status(500).send('error in server')
        }
    }
})

app.get('/list/:pageIndex', async (req, resp) => { // async await는 왜 사용하는걸까?
    var pageIndex = req.params.pageIndex;
    // pagenation 추가
    var result = await db.collection('post').find().skip((pageIndex - 1) * 5).limit(5).toArray(); // 기다려! JS는 참을성이 없다. 
    // var firstTitle = result[0].title;
    // resp.send(firstTitle);

    resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
})

// 앞으로 가기 버튼 구현
// skip은 느리다. -> find에 필터를 추가해서 가져오기
app.get('/list/next/:lastArticleId', async (req, resp) => { // async await는 왜 사용하는걸까?
    var id = req.params.lastArticleId;
    console.log(`1 : ${id}`);
    // pagenation 추가
    try {
        console.log(`2 : ${id}`);
        var result = await db.collection('post').find({ _id: { $gt: new ObjectId(id) } }).limit(5).toArray(); // 기다려! JS는 참을성이 없다. 
        console.log(`3 : ${id}`);
    } catch (error) {
        console.log('error 발생');
        console.log(error);
    }
    resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
})

// 뒤로가기 버튼 기능 구현
app.get('/list/prev/:firstArticleId', async (req, resp) => { // async await는 왜 사용하는걸까?
    var id = req.params.firstArticleId;
    console.log(`1 : ${id}`);
    try {
        console.log(`2 : ${id}`);
        var result = await db.collection('post').find({ _id: { $lt: new ObjectId(id) } }).limit(5).toArray(); // 기다려! JS는 참을성이 없다. 
        console.log(`3 : ${id}`);
        if (result) {
            resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
        }
    } catch (error) {
        console.log('error 발생');
        console.log(error);
    }
})

/**
 * get 상세페이지 -> ObjectId를 이용한.
 * TODO list 랜더링 시에 오브젝트 아이디를 각각의 글마다 붙여f놓는 것이 좀 필요할 듯
 */
app.get('/articles/:id', async (req, resp) => {
    // console.log(req.params);
    try {
        var articleId = req.params.id;
        // error_1.MongoInvalidArgumentError('Query filter must be a plain object or ObjectId');
        // 매칭되는 document가 없으면 null 값이 나오는구나.
        // var a, b, c = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
        // console.log(a, b ,c); // undefined undefined 매칭객체
        const article = await db.collection('post').findOne({ _id: new ObjectId(articleId) });
        if (article != null) {
            // redirect 시에 데이터는 어떻게 담지?
            resp.render('detail.ejs', { article: article }); // 뷰리졸버 덕분에 논리명만 입력하면 되는구나.
        } else {
            resp.status(404).send('Not Found!')
        }
    } catch (error) {
        resp.status(404).send('Not Found!')
    }
})

app.get('/news', (req, resp) => {
    // 몽고DB 테스트
    // db.collection('post').insertOne({title : 'first commit'})
    // 성공
    resp.send('오늘 화창함');
})

app.get('/about', (req, resp) => {
    resp.sendFile(__dirname + '/aboutMyself.html')
})

app.get('/about2', (req, resp) => {
    resp.send('nodemon 적용 성공');
})
app.get('/mypage', (req, resp) => {
    if (!req.user) {
        console.log('login 해 줘!');
        return resp.redirect('/login');
    } else {
        resp.render('mypage.ejs', { user: req.user });
    }
})


app.get('/time', (req, resp) => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime(); // 1710030312629

    function parseDay(day) {
        switch (day) {
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';

            case 2:
                return 'Tuesday';

            case 3:
                return 'Wendsday';

            case 4:
                return 'Thursday';

            case 5:
                return 'Friday';

            case 6:
                return 'Saturday';
        }
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // start with 0
    const date = now.getDate();
    const today = `${year}-${month}-${date}`;
    const day = parseDay(now.getDay());
    // returns a number representing the day of the week, starting with 0 for Sunday
    const hours = now.getHours();
    const minutes = now.getMinutes();

    resp.send(`Today is ${today} ${day} and the time is ${hours}:${minutes}.`)
})

app.delete('/articles/:id', async (req, resp) => {
    console.log(req.params);
    const id = req.params.id;
    try {
        const result = await db.collection('post').deleteOne({ _id: new ObjectId(id) });
        console.log(result); // javascript는 리턴 값이 대입하려는 변수보다 적은 경우 앞은 비우고 뒤는 채운다. 
        // { acknowledged: true, deletedCount: 1 }
        if (result.acknowledged && result.acknowledged > 0) { // 삭제된 행이 없어도 true를 보내준다. { acknowledged: true, deletedCount: 0 }
            console.log('success to delete data');
            resp.status(200).send(JSON.stringify({ result: true }))
        } else {
            resp.status(404).send('NOT FOUND')
        }
    } catch (error) {
        console.log('fail to delete data ' + error);
    }
})