// is user logined?
fetch('http://localhost:8080/login/status').then((response) => {
    console.log(response);
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json()
}).then((result) => {
    console.log(result);
    if (result.isLogin) {
        console.log(document.querySelector('.logout').classList.remove('d-none'));
    }
})

document.querySelector('.logout').addEventListener('click', function(){
    window.location.href = 'http://localhost:8080/logout';
})