// API분리를 위해서는 express 프레임워크의 router 필요함
const router  = require('express').Router()
router.get('/', (req, resp) => {
  console.log('i\'m in');
})

router.get('/sub/sports', (req, resp) => {
   resp.send('스포츠 게시판')
 })
 router.get('/sub/game', (req, resp) => {
   resp.send('게임 게시판')
 }) 

// 라우터 반환
module.exports = router;