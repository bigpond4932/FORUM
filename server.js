const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))

const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://admin:fe1XvxhTQ0BXzc2g@mydb1.qyw6vbb.mongodb.net/?retryWrites=true&w=majority&appName=mydb1'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  console.log(err)
})


app.get('/', (요청, 응답) => {
//   응답.send('반갑다')
    console.log(__dirname);
    응답.sendFile(__dirname + '/index.html')
}) 

app.get('/news', (req, resp) =>{
    // 몽고DB 테스트
    db.collection('post').insertOne({title : 'first commit'})
    resp.send('오늘 화창함');
})

app.get('/about', (req, resp) => {
    resp.sendFile(__dirname + '/aboutMyself.html')
})

app.get('/about2', (req, resp) => {
    resp.send('nodemon 적용 성공');
})