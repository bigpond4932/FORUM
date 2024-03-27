// 검색기능을 만들어 볼거임
// 힌트는 정규식..

// TODO
// 1. 검색 버튼누르면 검색란의 사용자 입력을 가져오기
document.querySelector('.search-send').addEventListener('click', function(){
    // 2. 사용자입력을 포함하는 (RDB Like) 모든 게시물을 가져오기
    let searchWord = document.querySelector('.search').value;
    // console.log(`searchWord: ${searchWord}`);
    // 서버로 요청 보내기 (페이지 전이를 이용할 것)
    window.location.href = `http://localhost:8080/search?searchword=${searchWord}`;
})
