const router = require('express').Router();
const connectDB = require('../database.js');
const bcrypt = require('bcrypt')

// Q. DB접근이 필요한 모든 라우터 파일에 이런식으로 커넥션을 얻는 코드를 작성해도 될까?..
let db;
connectDB.then((client) => {
   db = client.db('forum') 
}).catch((err) =>{
    console.log(err);
})

// 가입기능
router.get('/', (req, resp) => {
    resp.render('register.ejs');
})

router.post('/', async (req, resp) => {
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
router.get('/duplicate/:targetId', async (req, resp) => {
    let found = await db.collection('user').findOne({ username: req.params.targetId })
    if (found == null) {
        resp.send({ result: true })
    } else {
        resp.send({ result: false })
    }
})

module.exports = router;