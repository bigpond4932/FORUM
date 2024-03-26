const router = require('express').Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const connectDB = require('../database.js')

router.get('/', async (req, resp) => {
    console.log('hi');
    const agg = [
        {
          "$search": {
            "text": {
              "path": "title",
              "query": "war"
            },
            "sort": {unused: {$meta: "searchScore"}, "released": 1}
          }
        },
        {
          "$limit": 10
        },
        {
          "$project": {
            "_id": 0,
            "title": 1,
            "released": 1,
            "paginationToken" : { "$meta" : "searchSequenceToken" },
            "score": {$meta: "searchScore"}
          }
        }
      ];
    const agg2 = [
        {
          "$search": {
            "text": {
              "path": "title",
              "query": "war"
            },
            "sort": {unused: {$meta: "searchScore"}, "released": 1},
            "searchAfter": "CMtJGgYQuq+ngwgaCSkAjBYH7AAAAA=="
          }
        },
        {
          "$limit": 10
        },
        {
          "$project": {
            "_id": 0,
            "title": 1,
            "released": 1,
            "paginationToken" : { "$meta" : "searchSequenceToken" },
            "score": { "$meta": "searchScore" }
          }
        }
      ];  
    connectDB.then(async (client) => {
        const coll = client.db("sample_mflix").collection("movies");
        let cursor = await coll.aggregate(agg).toArray();
        // console.log(typeof(cursor));
        console.log(cursor);
        // let cursor = await coll.find();
        // await cursor.forEach((doc) => console.log(doc));
        client.close();
        resp.json(cursor);
    })
})
module.exports = router;