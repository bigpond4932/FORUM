const router = require('express').Router();
const passport = require('passport');
const { route } = require('./pagination');

// 로그인 페이지 보여주기
router.get('/', (req, resp) => {
    // ejs에서 status코드 사용시 보내주지 않으면 error남
    return resp.render('login.ejs', {status: 200});
})
// 로그인 요청
router.post('/',isInputEmpty, async (req, resp, next) => {
    // Q. passport는 server.js에서 가져오나? 참조가 가능하네?
    passport.authenticate('local', (error, user, info) => { // LocalStrategy에서 설정한 함수의 결과를 콜백함수의 파라미터로 사용
        console.log(error);
        console.debug(user);
        console.log(info);
        if (error) return resp.status(500).json(error)
        // 아이디 혹은 비밀번호가 틀렸다고 알려주고 싶음.
        if (!user) return resp.status(401).render('login.ejs', {status: 401})
        req.logIn(user, (err) => {
            if (err) return next(err)
            resp.redirect('/fortune')
        })
    })(req, resp, next) // 사용 방법이니까 깊은 이해는 조금 미루자고..
})

// login status
router.get('/status', (req, resp) =>{
    if(req.user != null){
        return resp.json({isLogin: true})
    }else{
        return resp.json({isLogin: false})
    }
})
// input 검증 로직 (임시)
function isInputEmpty(req, resp, next){
    let body = req.body
    console.log('is empty?');
    console.log(body);
    if(req.method == 'POST'){
        if(body.username == '' || body.password == ''){
            // resp.status(401).send('아이디 비밀번호 없이 어떻게 로그인 하나요?');
            return resp.render('login.ejs', {status: 401});
        }
    }
    next()
}

module.exports = router;