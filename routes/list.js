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
    let { page, pagesize } = req.query;
    console.log(req.query);
    page = parseInt(page, 10) || 1;
    pagesize = parseInt(pagesize, 10) || 8;
    console.log(`## page: ${page}`);
    console.log(`## pagesize: ${pagesize}`);
    const btnNum = 5;
    const range = Math.ceil(page/5);
    // const rangeOfMin = pagesize * range - 4; 
    const rangeOfMax = range * btnNum;
    console.log(rangeOfMax);

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
                data: [{ $skip: (page - 1) * pagesize }, { $limit: pagesize }],
            },
        },
    ]).toArray();
    let data = convertRegDateToUserTimezone(articles[0].data);
    console.log('after converting data start');
    console.log(data);
    console.log('after converting data start');
    const result = {
        articles: {
            metadata: {
                totalCount: articles[0].metadata[0].totalCount, 
                page: page,
                pagesize: pagesize,
                prev: page > 5 || false,
                next: rangeOfMax * pagesize < articles[0].metadata[0].totalCount || false,
                range: range
            },
            data: articles[0].data,
        },
    }
    console.log('articles[0].data start');
    console.log(articles[0].data);
    console.log('articles[0].data end');
    return resp.status(200).render('list.ejs', result); // ejs템플릿 사용시 sendFile 대신 render로 응답

    // prev버튼이 보여야 할 때는? 현재 페이지가 6이상의 페이지일 경우
    // next버튼이 보여야 할 때는? count > pageRangeMax*pagesize 일 경우
    // min = 1, max = min + 4
    // 범위 x는 5x - 4 ~ 5x

    // page 10은? -> 어디 범위임? 5~10까지 어케 구함?
    // 현재 페이지에 따라서 버튼의 range가 정해진다.
    // range = math.floor(page/5) okay

    // 버튼이 몇 개 있을지도 알 수 있지
    // numOfBtn = math.ceil(cnt/pagesize)

    // next 버튼 누르면.. max + 1 로 가겠죠
    // prev 버튼 누르면.. min - 1 로 가겠죠
})

function convertRegDateToUserTimezone(data) {
    return data.map(item => {
      const regDate = new Date(item.regDate);
      const today = new Date();
  
      // 현재 유저의 날짜와 regDate의 날짜가 같은 경우 시간으로 표시
      if (regDate.toDateString() === today.toDateString()) {
        return regDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      } else {
        // 다른 경우 날짜로 표시
        return regDate.toLocaleDateString('ko-KR');
      }
    });
  }
module.exports = router