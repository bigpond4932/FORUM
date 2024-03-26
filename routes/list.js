const router = require('express').Router();
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

router.get('/', async (req, resp) => { // Q. async await는 왜 사용하는걸까?
    let { page, pageSize } = req.query;
    page = parseInt(page, 10) || 1;
    pageSize = parseInt(pageSize, 10) || 5;

    /**
     * 페이지네이션에 필요한 것
     * $page 현재 사용자가 조회하고 있는 페이지 정보<page>(이동버튼 강조, 이동버튼범위)
     * $articlesAmount 게시물의 총 개수(이동버튼을 몇 개 만들어야 할지)
     * $token prev/next버튼을 위한 토큰(12345 -> 6 / 678910 -> 5)
     * $articles 페이지에 뿌릴 글목록데이터
     */
    // 아.. 진짜 개뻘짓함. node.js용 드라이버 설명서를 봤어야 되는데 계속 mongoDB CLI용 설명서를 보고있었다.
    // cursor은 array로 바꿔줘야 출력이 된다고... 이 자식아.
    const articles = await db.collection('post').aggregate([
        {
            $facet: {
                metadata: [{ $count: 'totalCount' }],
                data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
            },
        },
    ]).toArray();
    console.log(articles[0]);
    // resp.render('list.ejs', { articles: articles }); // ejs템플릿 사용시 sendFile 대신 render로 응답
    return resp.status(200).json({
        result: 'OK'
    });
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