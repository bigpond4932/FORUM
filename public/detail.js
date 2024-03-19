// 뭘 할거냐. edit 버튼을 누르면 edit Form 형태로 바꿔줄 거임
// 1. 글 수정 모드로 전환하기.
document.querySelector('.edit-btn').addEventListener('click', function () {
    document.querySelector('.cancel').classList.remove('hide');
    if (document.querySelector('.form-box') != null) {
        document.querySelector('.form-box').classList.remove('hide');
        const childElement = document.querySelector('.list-box').children;
        for (let i = 1; i < childElement.length; i++) {
            childElement[i].classList.add('hide');
            console.log(childElement[i].classList);
        }
    }else{
        // 2. list-box를 Form으로 변경해주기
        const listBox = document.querySelector('.list-box');
        const childElement = document.querySelector('.list-box').children;
        for (let i = 0; i < childElement.length; i++) {
            childElement[i].classList.add('hide');
            console.log(childElement[i].classList);
        }
    
        const title = document.querySelector('.list-box').children[0].innerHTML;
        const content = document.querySelector('.list-box').children[1].innerHTML;
        const id = document.querySelector('.list-box').children[2].innerHTML;
    
        // 3. list-box 안의 데이터들을 각각의 input 박스에 뿌려주기
        const template = `<form action = "/write" method = "put" class="form-box">
                title<input type="text" name="title" value="${title}">
                content<input type="text" name="content" value="${content}">
                <button type="submit">전송</button>
                <input type="hidden" name="id" value="${id}">
            </form>`
        listBox.insertAdjacentHTML('afterbegin', template);
    }
});
// 4.취소 버튼을 누르면 다시 읽기모드로 전환
document.querySelector('.cancel').addEventListener('click', function () {
    // 기존 글 다시 보이게 하기
    const childElement = document.querySelector('.list-box').children;
    for (let i = 0; i < childElement.length; i++) {
        childElement[i].classList.remove('hide');
    }
    console.log(document.querySelector('.form-box'));
    document.querySelector('.form-box').classList.add('hide');
    console.log(document.querySelector('.form-box').classList);

    document.querySelector('.cancel').classList.add('hide');
});
