var targets = document.querySelectorAll('.title');
targets.forEach((t) => {
    t.addEventListener("click", function () {
        console.log("t is pressed");
        var id = this.id;
        // redirect
        window.location.href = `http://localhost:8080/articles/${id}`;
    })
    // fetch(`http://localhost:8080/articles/${id}`)
    //     .then(response => { 
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok ' + response.statusText);
    //         }
    //         return response
    //     })
    //     .then(data => {
    //         console.log(data); // 가져온 데이터 처리
    //         // 여기에서 가져온 데이터를 사용하여 무언가를 할 수 있습니다.
    //         // 예: 동적으로 UI 업데이트
    //     })
    //     .catch(error => {
    //         console.error('Fetch error:', error);
    //         // 에러 처리 로직
    //     });
});

var deleteBtns = document.querySelectorAll('.delete');
deleteBtns.forEach(btn => {
    btn.addEventListener('click', function(){
        var deleteTargetId = this.parentNode.parentNode.children[0].id;
        console.log(deleteTargetId);
        fetch(`http://localhost:8080/articles/${deleteTargetId}`, {
            method : 'DELETE',
        });
    })
});