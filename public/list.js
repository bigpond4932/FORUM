// 비동기로 페이징시도 -> 아니다. 페이지 버튼 만들어줘야한다. (랜더링 할 때 몇 개인지 알고 있어야 함.)
let pageNow = 1;
let maxPageNum = fetch('/pages')
    .then(resp => {
        if (!resp.ok) {
            throw new Error('Network response was not ok')
        }
        return resp.json();
    }).catch(e => {
        console.log(e);
    });
console.log(maxPageNum);

document.querySelectorAll('.move').forEach(btn => {
    btn.addEventListener('click', function (e) {
        var type = this.id
        if (type == 'prev') {
            if (pageNow == 1) {
                e.preventDefault()
                console.log('no more prev page');
            }else{
                pageNow -= 1;
            }
        } else {
            // 결국 몇 개인지 알아야.. 
            if (maxPageNum == pageNow){
                e.preventDefault()
                console.log('no more next page');
            }else{
                pageNow += 1;
            }
        }
        console.log(`pageNow : ${pageNow}`);
    })
})