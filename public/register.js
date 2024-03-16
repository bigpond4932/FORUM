var isValidUsername = false;
var isValidPassword = false;
var isVaildRenterPw = false;
document.querySelector('#username').addEventListener('blur', async function () {
    var usernameInput = this;
    var msg = document.querySelector('.msg');
    // / . # 등으로 시작하는 아이디를 검증하는 로직도 필요함
    if (usernameInput.value == '') {
        usernameInput.style.border = '1px solid black';
        msg.classList.add('hide');
        return
    }
    fetch(`/duplicate/${usernameInput.value}`)
        .then(resp => {
            if (!resp.ok) {
                throw new Error('Network response was not ok')
            }
            return resp.json()
        })
        .then(data => {
            if (data.result) {
                console.log('not duplicated');
                usernameInput.style.border = '2px solid green';
                msg.innerHTML = '사용가능한 아이디 입니다';
                msg.style.color = 'green';
                msg.classList.remove('hide');
                isValidUsername = true;
            } else {
                usernameInput.style.border = '2px solid red';
                msg.innerHTML = '다른 아이디를 이용해주세요';
                msg.style.color = 'red';
                msg.classList.remove('hide');
                isValidUsername = false;
            }
        })
        .catch(error => {
            console.log(error);
        })
})
var passwordInput = document.querySelector('#password');
console.log();
passwordInput.addEventListener('blur', function () {
    var msg = document.querySelector('.pwmsg');
    if (passwordInput.value == '') {
        passwordInput.style.border = '1px solid black';
        msg.classList.add('hide');
        return
    }
    // 10자 이상 인지만 검증하자.
    if (passwordInput.value.length > 9) {
        passwordInput.style.border = '2px solid green';
        msg.innerHTML = '유효한 비밀번호 입니다';
        msg.style.color = 'green';
        msg.classList.remove('hide');
        isValidPassword = true;
    } else {
        passwordInput.style.border = '2px solid red';
        msg.innerHTML = '10자 이상의 비밀번호를 이용해 주세요';
        msg.style.color = 'red';
        msg.classList.remove('hide');
    }
})
// 비밀번호 일치하는지 검증
document.querySelector('#re-enter').addEventListener('blur', function () {
    let msg = document.querySelector('.re-enter')
    if (isValidPassword) {
        let pw = document.querySelector('#password').value;
        console.log(pw);
        console.log(this.innerHTML);
        if (pw == this.value) {
            this.style.border = '2px solid green';
            msg.innerHTML = '비밀번호 일치';
            msg.style.color = 'green';
            msg.classList.remove('hide');
            isVaildRenterPw = true;
        }else{
            this.style.border = '2px solid red';
            msg.innerHTML = '비밀번호 불일치';
            msg.style.color = 'red';
            msg.classList.remove('hide');
            isVaildRenterPw = false;
        }
    }else{
        this.style.border = '2px solid black';
        msg.classList.add('hide');
    }
})
// 가입요청
var registerBtn = document.querySelector('.register');
console.log(registerBtn);
registerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    // 가입 req
    if (isValidUsername && isValidPassword && isVaildRenterPw) {
        document.querySelector('form').submit()
    } else {
        alert('아이디 또는 비밀번호가 유효하지 않습니다. ')
    }
})