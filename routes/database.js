const router = require('express').Router();
const connectDB = require('../database.js');
const assert = require("assert");
const { ObjectId } = require('mongodb');

let coll;
connectDB.then((client) => {
    // coll = client.db('sample_mflix').collection('movies');
    db = client.db('forum');
}).catch((err) => {
    console.log(err);
})
router.get('/init', async (req, resp) => {
    try {
        await db.collection('inventory').insertMany([
            {
              item: 'journal',
              instock: [
                { warehouse: 'A', qty: 5 },
                { warehouse: 'C', qty: 15 }
              ]
            },
            {
              item: 'notebook',
              instock: [{ warehouse: 'C', qty: 5 }]
            },
            {
              item: 'paper',
              instock: [
                { warehouse: 'A', qty: 60 },
                { warehouse: 'B', qty: 15 }
              ]
            },
            {
              item: 'planner',
              instock: [
                { warehouse: 'A', qty: 40 },
                { warehouse: 'B', qty: 5 }
              ]
            },
            {
              item: 'postcard',
              instock: [
                { warehouse: 'B', qty: 15 },
                { warehouse: 'C', qty: 35 }
              ]
            }
          ]);
    } catch (error) {
        console.log(error);
    }
    resp.send('OK');
})

router.get('/example', async (req, resp) => {
    try {
        // 전부 찾기
        // let data = await db.collection('inventory').find().toArray();

        // tags에 red, blank가 있는 도큐먼트만 찾기
        // let query = {tags:['red', 'blank']};

        // :all operater로 red, blank를 태그의 값으로 포함하는 모든 도큐먼트 찾기
        // Point 순서나 배열의 다른 요소에 관계없이!!
        // let query = {tags: {$all: ['red', 'blank']}}

        //red가 들어간 모든 도큐먼트를 찾기
        // let query = { tags: 'red' }
        
        // 최소한 하나의 요소가 조건을 충족하면.
        let query = { dim_cm: { $elemMatch: { $gt: 9.9, $lt: 13 } } }
        
        // 요소 중 어떤 조합이나 하나의 요소가 조건을 충족하면... 
        // let query = { dim_cm: { $gt: 15.25, $lt: 16 } }

        let data = await db.collection('inventory').find(query).toArray();
        return resp.json(data);
    } catch (error) {
        console.log(error);
        resp.status(500).send('ERROR');
    }

})

router.get('/', async (req, resp) => {
    console.log('database training');
    // zips 컬렉션에 있는 모든 데이터를 가져오기. toArray로 배열로 변환시켜서 루프시키는게 중요함. 
    // const cursor = await db.collection('zips').find().toArray();

    const agg = [
        {
            "$search": {
                // 모든 글을 가져오고 싶어. 어떻게 설정해야 되나?
                // Query should contain either operator or collector ... 
                // operator / collector 
                "text": {
                    "query": "tom hanks", // 일치하는 거 찾아와라.
                    "path": "cast" // 특정 필드를 기준
                }
            }
        },
        {
            "$project": {
                "_id": 0, // 0이면 포함하지 말아라
                "title": 1, // 1이면 포함해라
                "cast": 1
            }
        },
        {
            "$skip": 10
        },
        {
            "$limit": 50
        }
    ];

    // let cursor = await coll.aggregate(agg).toArray();
    // let cursor = await coll.find().limit(5).toArray(); // ??
    /**
     * Q. 왜 False옵션이 안먹힐까?
     * node.js 드라이버랑 mongosh, mongoDB cli에서의 쿼리는 다르다.
     * projection을 통한 특정 필드값만 뽑아오기.
    */
    // let cursor = await coll.find({}, {projection: {_id:false}}, {}).limit(5); 

    /**
     * query embeded or nested data with dot
     * imdb rating이 7.3 이상인 것만
     * { field: { $gt: value } } 이런 형식으로 써야함.
     */

    // let cursor = await coll.find(
    //     {
    //         'imdb.rating': {
    //             $gt: 7.3, // Opertation 이라고 한다.
    //         },
    //         'tomatoes.viewer.numReviews': { $gte: 1000 } // AND condition
    //     }, {}, {}).limit(5);
    let data = await db.collection('inventory').find().toArray();
    resp.json(data);
})

module.exports = router;