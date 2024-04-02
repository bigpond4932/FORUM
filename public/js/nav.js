document.addEventListener('DOMContentLoaded', function () {
    // 현재 페이지의 URL을 가져옵니다.
    var currentPage = window.location.pathname;
    // 모든 링크에 대해 루프를 돌면서 현재 페이지와 링크의 href 속성을 비교합니다.
    document.querySelectorAll('.nav-item a').forEach(function (link) {
        if (link.getAttribute('href') === currentPage) {
            // 현재 페이지에 해당하는 링크에 active 클래스를 추가합니다.
            link.classList.add('active');
        }
    });
});