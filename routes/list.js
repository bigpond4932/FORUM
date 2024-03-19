const router = require('express').Router();
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

router.get('/:pageIndex', async (req, resp) => { // Q. async await는 왜 사용하는걸까?
    var pageIndex = req.params.pageIndex;
    // pagenation 추가
    var result = await db.collection('post').find()
        .skip((pageIndex - 1) * 5).limit(5).toArray();
    resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
})

router.get('/pages', async (req, resp) => {
    try {
        var articles = await db.collection('post').find().toArray();
        numOfArticles = articles.length;
        var maxPageNum = Math.ceil(numOfArticles / 5);
        resp.json({ maxPageNum: maxPageNum });
    } catch (error) {
        resp.status(500).send(error);
    }
})

// 앞으로 가기 버튼 구현
// skip은 느리다. -> find에 필터를 추가해서 가져오기
router.get('/next/:lastArticleId', async (req, resp) => { // async await는 왜 사용하는걸까?
    var id = req.params.lastArticleId;
    console.log(`1 : ${id}`);
    // pagenation 추가
    try {
        console.log(`2 : ${id}`);
        var result = await db.collection('post').find({ _id: { $gt: new ObjectId(id) } }).limit(5).toArray(); // 기다려! JS는 참을성이 없다. 
        if (result.length > 0) {
            resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
        } else {
            resp.status(404).send('no more next page');
        }

    } catch (error) {
        console.log('error 발생');
        console.log(error);
    }
})

// 뒤로가기 버튼 기능 구현
router.get('/prev/:firstArticleId', async (req, resp) => { // async await는 왜 사용하는걸까?
    var id = req.params.firstArticleId;
    console.log(`1 : ${id}`);
    try {
        var result = await db.collection('post').find({ _id: { $lt: new ObjectId(id) } }).limit(5).toArray(); // 기다려! JS는 참을성이 없다. 
        console.log(result); // 요청에 맞는 결과가 없을 시 return [] 
        if (result.length > 0) {
            resp.render('list.ejs', { articles: result }); // ejs템플릿 사용시 sendFile 대신 render로 응답
        } else {
            resp.status(404).send('no more prev page');
        }
    } catch (error) {
        console.log('error 발생');
        console.log(error);
    }
})

module.exports = router