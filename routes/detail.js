const router = require('express').Router();
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');

let db;
connectDB.then((client) => {
   db = client.db('forum') 
}).catch((err) =>{
    console.log(err);
})
/**
 * get 상세페이지 -> ObjectId를 이용한.
 * TODO list 랜더링 시에 오브젝트 아이디를 각각의 글마다 붙여f놓는 것이 좀 필요할 듯
 */
router.get('/:id', async (req, resp) => {
    // console.log(req.params);
    try {
        var articleId = req.params.id;
        console.log(`detail id : ${articleId}`);
        // error_1.MongoInvalidArgumentError('Query filter must be a plain object or ObjectId');
        // 매칭되는 document가 없으면 null 값이 나오는구나.
        // var a, b, c = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
        // console.log(a, b ,c); // undefined undefined 매칭객체
        const article = await db.collection('post').findOne({ _id: new ObjectId(articleId) });
        console.log(article);
        if (article != null) {
            console.log(article);
            // redirect 시에 데이터는 어떻게 담지?
            resp.render('detail.ejs', { article: article }); // 뷰리졸버 덕분에 논리명만 입력하면 되는구나.
        } else {
            console.log(`article is null`);
            resp.status(404).send('Not Found!')
        }
    } catch (error) {
        console.log(`error`);
        resp.status(404).send(error)
    }
})

module.exports = router