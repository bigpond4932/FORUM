const router = require('express').Router();

// 점치기
router.get('/', (req, resp) => {
    return resp.render('fortune.ejs')
})

// 점치기
router.post('/', (req, resp) => {
    return resp.json(askAFortune());
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
    let result = iCingMap[downHex][upHex];
    if (result === 1 || result === 2) {
        return askAFortune();
    } else {
        // hexgramType과 yaoSequence를 반환하는 객체 구조로 변경
        return { hexgramType: result, yaoSequence: hexagram };
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