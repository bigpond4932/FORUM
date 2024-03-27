const router = require('express').Router()
const connectDB = require('../database.js');

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

router.get('/', async (req, resp) => {
    // console.log(req.query);
    let searchWord = req.query.searchword;
    // console.log(`searchWord: ${searchWord}`);
    // let query = {title: searchWord}
    let query = {title: {$regex : searchWord}}
    try {
        const result = await db.collection('post').find(query).toArray();
        return resp.json(result);
    } catch (error) {
        console.log(error);
    }
})

module.exports = router