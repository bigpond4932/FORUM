const router = require('express').Router();
const connectDB = require('../database.js');
const { ObjectId } = require('mongodb');
const upload = require('../s3-config.js');

let db;
connectDB.then((client) => {
    db = client.db('forum')
}).catch((err) => {
    console.log(err);
})

// 글 작성페이지
router.get('/', (req, resp) => {
    return resp.render('write.ejs')
})

// 글 작성기능
router.post('/', upload.single('img1'), async (req, resp) => { // async가 없으면
    // 업로드 코드
    console.log(req.file); // 파일을 업로드해도 upload() 미들웨어를 호출하지 않으면 빈 객체구나...
    // 글 저장시에 이미지 파일도 업로드가 됐다면, 같이 저장을 해두자.
    // document에 키 추가하는 것은 그냥 따로 설정 필요없다. imgLocation: req.location 박아버리면 된다.
    var body = req.body;
    var title = body.title;
    var content = body.content;
    var username = req.user.username;
    var imgUrl;
    if (req.file != null) {
        imgUrl = req.file.location;
    } else {
        imgUrl = null;
    }
    console.log(title, content); // req-body parser가 필요하다.
    if (title == '') {
        resp.send('title을 입력해주세요');
    } else {
        try {
            // 요청부분을 받기 -> 필요한 부분 몽고디비에 저장하기
            var result = await db.collection('post')
                .insertOne({
                    username: username,
                    title: title,
                    content: content,
                    imgUrl: imgUrl
                });
            if (result.acknowledged) {
                resp.redirect(`/articles/${result.insertedId}`);
            } else {
                resp.status(500).send('DB connection failed');
            }
        } catch (e) {
            console.log(e);
            resp.status(500).send('error in server')
        }
    }
})


// 글 수정기능 => 글 작성자 본인만 수정 가능하도록 변경.
router.put('/', async (req, resp) => {
    var body = req.body;
    var title = body.title;
    var content = body.content;
    var id = body.id; // 글 식별자
    // console.log(title, content, id);
    try {
        // Create a filter for _id is id
        const filter = { _id: new ObjectId(id) };
        /* Set the upsert option to insert a document if no documents match
        the filter */
        const options = { upsert: false };
        // write update doc
        const updateDoc = {
            $set: {
                title: title,
                content: content
            },
        };
        if (isAritcleOwner(req.user, id)) {
            console.log('올바르지 않은 글 수정 요청. ' + req.user.username);
            return resp.send('글 작성자가 아니면 글을 수정할 수 없습니다.');
        }

        // Update the first document that matches the filter
        const result = await db.collection('post').updateOne(filter, updateDoc, options);

        // Print the number of matching and modified documents
        console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
        );
        resp.redirect(`/articles/${id}`);
    } catch (error) {
        resp.status(500).send('fail to update data')
    }
    // finally{
    //     await client.close();
    // }
})
// 글 삭제
router.delete('/:id', async (req, resp) => {
    // Q. null 과 'null' 은 다르지? 빈 스트링 객체 '' 와 null 다르지? 

    if (isAritcleOwner(req.user, req.params.id)) {
        // 삭제처리 진행
        try {
            // Q. new ObjectId()에서 오류나면 서버에러 나나? ...
            let id = req.params.id;
            const result = await db.collection('post').deleteOne({ _id: new ObjectId(id) });
            if (result.acknowledged && result.acknowledged > 0) { // 삭제된 행이 없어도 true를 보내준다. { acknowledged: true, deletedCount: 0 }
                console.log('success to delete data. id : ' + id);
                return resp.redirect('/list/1');
            } else {
                return resp.status(404).send('NOT FOUND')
            }
        } catch (error) {
            console.log('fail to delete data ' + error);
        }
    }

    return resp.status(400).send('작성자 이외에는 글을 삭제할 수 없습니다.');
})

// 수정/삭제 요청자와 글 작성자가 일치하는지 검증.
async function isAritcleOwner(user, articleId) {
    // 관리자일 경우 삭제가능
    // if (user.role = 'ADMIN'){
    //     return true
    // }
    let article = await db.collection('post').findOne({ _id: new ObjectId(articleId) });
    if (article != null && user.username == article.username) {
        return true;
    }
    return false;
}

// 리스트화면에서의 글삭제 기능 -> 사용x
// router.delete('/articles/:id', async (req, resp) => {
//     console.log(req.params);
//     const id = req.params.id;
//     try {
//         const result = await db.collection('post').deleteOne({ _id: new ObjectId(id) });
//         console.log(result); // javascript는 리턴 값이 대입하려는 변수보다 적은 경우 앞은 비우고 뒤는 채운다. 
//         // { acknowledged: true, deletedCount: 1 }
//         if (result.acknowledged && result.acknowledged > 0) { // 삭제된 행이 없어도 true를 보내준다. { acknowledged: true, deletedCount: 0 }
//             console.log('success to delete data');
//             resp.status(200).send(JSON.stringify({ result: true }))
//         } else {
//             resp.status(404).send('NOT FOUND')
//         }
//     } catch (error) {
//         console.log('fail to delete data ' + error);
//     }
// })

module.exports = router