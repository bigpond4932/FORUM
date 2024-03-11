const express = require('express')
// 예시: Node.js 코드에서 환경 변수 사용
const app = express()
const process = require('dotenv').config(); // dotenv 패키지를 사용해 .env 파일 로드

app.use(express.static(__dirname + '/public')) // static 파일은 public 하위폴더에서 가져가라
app.set('view engine', 'ejs') // ejs 사용을 위한 세팅
app.use(express.urlencoded({ extended: true })); // form-data를 처리하기 위한 설정
const { ObjectId } = require('mongodb')
const { MongoClient } = require('mongodb')

let db
// 보안을 위해 설정들은 .env파일에서 변수로 가져다 쓰기
const url = process.parsed.DATABASE_URL;
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



app.post('/save', async (req, resp) => {
    var body = req.body;
    var title = body.title;
    var content = body.content;
    var id = body.id;
    // console.log(title, content, id);
    try {
        await db.collection('post').insertOne({ title: title, content: content });
        resp.redirect('/list');
    } catch (error) {
        resp.status(500).send('fail to update data')
    }
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
            await db.collection('post').insertOne({ title: title, content: content });
            resp.redirect('/list');
        } catch (e) {
            console.log(e);
            resp.status(500).send('error in server')
        }
    }
})

app.get('/list', async (req, resp) => { // async await는 왜 사용하는걸까?
    var result = await db.collection('post').find().toArray(); // 기다려! JS는 참을성이 없다. 
    // var firstTitle = result[0].title;
    // resp.send(firstTitle);

    resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
})

/**
 * get 상세페이지 -> ObjectId를 이용한.
 * TODO list 랜더링 시에 오브젝트 아이디를 각각의 글마다 붙여f놓는 것이 좀 필요할 듯
 */
app.get('/articles/:id', async (req, resp) => {
    console.log(req.params);
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