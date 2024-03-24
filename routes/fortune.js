const router = require('express').Router();
const e = require('express');
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

// 점치기 페이지로 이동
router.get('/', async (req, resp) => {
    try {
        // find는 커서를 반환을 하는구나?
        const cursor = await db.collection('post').find({writer: { $eq: req.user.username }});
        for await(const doc of cursor){
            console.log(doc);
        }

        console.log(new Date(new Date().setHours(0, 0, 0)));
        console.log(new Date(new Date().setHours(23, 59, 59)));
        let query = {
            writer: { $eq: req.user.username },
            regDate: {
                $gte: new Date(new Date().setHours(0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59)),
            }
        }
        const numOfDailyAsking = await db.collection('post').countDocuments(query);
        if(numOfDailyAsking <= 2){
            return resp.render('fortune.ejs', {remain: 3 - numOfDailyAsking})
        }else{
            return resp.send("you already use all your chance.");
        }
    } catch (error) {
        console.log('error');
    }
    // 유저가 '오늘' 점을 친 횟수 횟수를 같이 넘겨주면 좋겠는데?
})

// 점괘 생성해서 받아오기 -> post처리 하니까 갑자기 왜 로그인이 필요하누?..
router.post('/', async (req, resp) => {
    let response = {}
    const body = req.body;
    const user = req.user;
    const guaResult = askAFortune();
    response.guaResult = guaResult;
    // 사용자의 이름으로 글 자동생성
    let article = {};
    // article필요한 키 => 작성자 / 작성일 / 타이틀 / 점괘 / 작성한내용 / 괘의 설명보기 링크(ekikyou/괘번호.net)
    article.title = body.title;
    article.writer = user.username;
    article.regDate = new Date();
    article.gua = guaResult.guaNum;
    article.content = '';
    // 더 필요한거 있나? 글이 작성되었으면 링크를 제공해야 할까? 내가 작성한 글 보기
    console.log(article);
    try {
        const articleId = await db.collection('post').insertOne(article);
        response.articleId = articleId;
        return resp.json(response);
    } catch (error) {
        console.log('글 작성 실패');
        // 에러페이지 같은 것이 있으면 좋겠다.
        return resp.status(500).send('글 작성 실패...')
    }
})

const Coin = {
    front: 3,
    back: 2,
    toss() {
        return Math.random() < 0.5 ? this.front : this.back;
    }
};

const iCingMap = [
    [],
    [0, 1, 43, 14, 34, 9, 5, 26, 11],
    [0, 10, 58, 38, 54, 61, 60, 41, 19],
    [0, 13, 49, 30, 55, 37, 63, 22, 36],
    [0, 25, 17, 21, 51, 42, 3, 27, 24],
    [0, 44, 28, 50, 32, 57, 48, 18, 46],
    [0, 6, 47, 64, 40, 59, 29, 4, 7],
    [0, 33, 31, 56, 62, 53, 39, 52, 15],
    [0, 12, 45, 35, 16, 20, 8, 23, 2]
];
const EightTrigrams = {
    SKY: 1,
    LAKE: 2,
    FIRE: 3,
    THUNDER: 4,
    WIND: 5,
    WATER: 6,
    MOUNTAIN: 7,
    EARTH: 8,
    getNumber(trigram) {
        return this[trigram];
    }
};


function testAllHexagramsCanBeGenerated() {
    const hexagramCounts = {};
    let attempts = 0;
    const maxAttempts = 10000; // 충분히 많은 시도를 하여 대부분의 괘를 얻을 수 있도록 설정

    while (Object.keys(hexagramCounts).length < 62 && attempts < maxAttempts) { // 3번부터 64번까지 괘를 확인하므로 총 62개
        const result = askAFortune();
        const hexType = result.hexgramType;
        if (hexType !== 1 && hexType !== 2) { // 1번(건괘)과 2번(곤괘) 제외
            hexagramCounts[hexType] = (hexagramCounts[hexType] || 0) + 1;
        }
        attempts++;
    }

    console.log(`Test completed in ${attempts} attempts`);
    const missingHexagrams = [];
    for (let i = 3; i <= 64; i++) {
        if (!hexagramCounts[i]) {
            missingHexagrams.push(i);
        }
    }

    if (missingHexagrams.length > 0) {
        console.error("Missing Hexagrams:", missingHexagrams);
        console.assert(false, `Not all hexagrams were generated. Missing: ${missingHexagrams.join(", ")}`);
    } else {
        console.log("Success! All hexagrams were generated at least once.");
    }
}
function askAFortune() {
    let hexagram = new Array(6).fill(0); // 인덱스 0에서 시작하므로 크기를 6으로 조정
    for (let i = 0; i < 6; i++) { // 인덱스 0에서 시작
        hexagram[i] = getLine() % 2 === 0 ? 0 : 1;
    }
    let downHex = judgeHex(hexagram[0], hexagram[1], hexagram[2]);
    let upHex = judgeHex(hexagram[3], hexagram[4], hexagram[5]);
    let guaNum = iCingMap[downHex][upHex];
    if (guaNum === 1 || guaNum === 2) {
        return askAFortune();
    } else {
        // hexgramType과 yaoSequence를 반환하는 객체 구조로 변경
        return { guaNum: guaNum, yaoSequence: hexagram };
    }
}

function judgeHex(line1, line2, line3) {
    if (line1 === 1) {
        if (line2 === 1) {
            return line3 === 1 ? EightTrigrams.SKY : EightTrigrams.LAKE;
        } else {
            return line3 === 1 ? EightTrigrams.FIRE : EightTrigrams.THUNDER;
        }
    } else {
        if (line2 === 1) {
            return line3 === 1 ? EightTrigrams.WIND : EightTrigrams.WATER;
        } else {
            return line3 === 1 ? EightTrigrams.MOUNTAIN : EightTrigrams.EARTH;
        }
    }
}

function getLine() {
    let result = 0;
    for (let i = 1; i < 4; i++) {
        result += Coin.toss();
    }
    return result;
}

module.exports = router;