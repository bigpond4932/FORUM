const router = require('express').Router();
const e = require('express');
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');

let db;
connectDB.then((client) => {
    console.log('success to get connetion to forum');
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

// 점치기 페이지로 이동
router.get('/', async (req, resp) => {
    try {
        // find는 커서를 반환을 하는구나?
        const cursor = await db.collection('post').find({ writer: { $eq: req.user.username } });
        console.log(req.user.username + '\'s articles');
        for await (const doc of cursor) {
            console.log(doc);
        }

        console.log(new Date(new Date().setHours(0, 0, 0)));
        console.log(new Date(new Date().setHours(23, 59, 59)));
        const numOfDailyAsking = await findUserArticles(db, req.user.username);

        return resp.render('fortune.ejs', { remain: 3 - numOfDailyAsking })
    } catch (error) {
        console.log('db error');
        console.log(error);
    }


    // 유저가 '오늘' 점을 친 횟수 횟수를 같이 넘겨주면 좋겠는데?
})

// 점괘 생성해서 받아오기 -> post처리 하니까 갑자기 왜 로그인이 필요하누?..
router.post('/', async (req, resp) => {
    let response = {}
    const body = req.body;
    const user = req.user;
    const numOfDailyAsking = await findUserArticles(db, req.user.username);
    // if (numOfDailyAsking > 2) {
    //     return resp.json({result: false, message: 'your chances are used. please try tomorrow.'})
    // }
    const guaResult = askAFortune();
    response.guaResult = guaResult;
    // 사용자의 이름으로 글 자동생성
    let article = {};
    // article데이터 구조
    article.title = body.title; // 질문내용
    article.writer = user.username; // 작성자
    article.regDate = new Date(); // 작성일
    article.guaNum = guaResult.guaInfo.guaNum; // 점괘 순서
    article.guaName = guaResult.guaInfo.guaName; // 점괘 이름
    article.upHex = guaResult.trigramInfo.up;
    article.downHex = guaResult.trigramInfo.down;
    article.content = ''; // 괘상에 대한 의견
    // 더 필요한거 있나? 글이 작성되었으면 링크를 제공해야 할까? 내가 작성한 글 보기
    console.log(article);
    try {
        const articleId = await db.collection('post').insertOne(article);
        response.articleId = articleId;
        response.result = true;
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

const GUAORDER = [
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

const GUANAMES = {
    1: '乾', 2: '坤', 3: '屯', 4: '蒙', 5: '需', 6: '訟', 7: '師', 8: '比',
    9: '小畜', 10: '履', 11: '泰', 12: '否', 13: '同人', 14: '大有', 15: '謙', 16: '豫',
    17: '隨', 18: '蠱', 19: '臨', 20: '觀', 21: '噬嗑', 22: '賁', 23: '剝', 24: '復',
    25: '無妄', 26: '大畜', 27: '頤', 28: '大過', 29: '坎', 30: '離', 31: '咸', 32: '恆',
    33: '遯', 34: '大壯', 35: '晉', 36: '明夷', 37: '家人', 38: '睽', 39: '蹇', 40: '解',
    41: '損', 42: '益', 43: '夬', 44: '姤', 45: '萃', 46: '升', 47: '困', 48: '井',
    49: '革', 50: '鼎', 51: '震', 52: '艮', 53: '漸', 54: '歸妹', 55: '豐', 56: '旅',
    57: '巽', 58: '兌', 59: '渙', 60: '節', 61: '中孚', 62: '小過', 63: '既濟', 64: '未濟',
};

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
const TrigramsName = [
    '',
    '天',
    '沢',
    '火',
    '雷',
    '風',
    '水',
    '山',
    '土'
]

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
// 점괘를 얻어오기
function askAFortune() {
    let hexagram = new Array(6).fill(0); // 인덱스 0에서 시작하므로 크기를 6으로 조정
    for (let i = 0; i < 6; i++) { // 인덱스 0에서 시작
        hexagram[i] = getLine() % 2 === 0 ? 0 : 1;
    }
    let downHex = judgeHex(hexagram[0], hexagram[1], hexagram[2]);
    let upHex = judgeHex(hexagram[3], hexagram[4], hexagram[5]);
    let trigramInfo = {up: TrigramsName[upHex], down: TrigramsName[downHex]} 
    let guaNum = GUAORDER[downHex][upHex];
    let guaName = GUANAMES[guaNum.toString()];
    let guaInfo = {guaNum: guaNum, guaName: guaName};
    if (guaNum === 1 || guaNum === 2) {
        return askAFortune();
    } else {
        // 괘의 정보와 괘를 그리기 위한 정보, 상괘 하괘의 정보
        return { guaInfo: guaInfo, yaoSequence: hexagram, trigramInfo: trigramInfo};
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

async function findUserArticles(db, username) {
    let query = {
        writer: { $eq: username },
        regDate: {
            $gte: new Date(new Date().setHours(0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59)),
        }
    };
    const numOfDailyAsking = await db.collection('post').countDocuments(query);
    return numOfDailyAsking;
}

module.exports = router;