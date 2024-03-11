// 뭘 할거냐. edit 버튼을 누르면 edit Form 형태로 바꿔줄 거임
// 1. save버튼을 보이게 하기
console.log(document.querySelector('.edit-btn'));
document.querySelector('.edit-btn').addEventListener('click', function () {
    document.querySelector('.save-btn').classList.remove('hide');
    // 2. list-box를 Form으로 변경해주기
    const listBox = document.querySelector('.list-box');
    const childElement = document.querySelector('.list-box').children;
    for(let i = 0; i < childElement.length; i++){
        childElement[i].classList.add('hide');
    }
    
    const title = document.querySelector('.list-box').children[0].innerHTML;
    const content = document.querySelector('.list-box').children[1].innerHTML;
    const id = document.querySelector('.list-box').children[2].innerHTML;
    
    // 3. list-box 안의 데이터들을 각각의 input 박스에 뿌려주기
    const template = `<form action = "/save" method = "post">
            title<input type="text" name="title" value="${title}">
            content<input type="text" name="content" value="${content}">
            <input type="hidden" name="id" value="${id}">
        </form>`
        listBox.insertAdjacentHTML('afterbegin', template);
    });
    // 4. 보존버튼 누르면 요청한 _id로 수정된 글이 요청됨
    document.querySelector('.save-btn').addEventListener('click', function(){
        document.querySelector('form').submit();
    });
