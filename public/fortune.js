document.getElementById('drawGua').addEventListener('click', async function (e) {
    // 일단 form요청하는 거 멈춰봐
    e.preventDefault();
    let title;
    let seletBox = document.querySelector('select');
    if (seletBox.selectedIndex !== 3) {
        title = seletBox.value;
    } else {
        title = document.querySelector('input').innerHTML;
    }
    // 괘를 서버에서 받아오자
    const result = await fetch('/fortune',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // 요청의 본문이 JSON 형태임을 명시
            },
            body: JSON.stringify({ title: title })
        }).then(result => {
            if (result.ok) {
                return result.json();
            }
        }).then(data => {
            console.log(data);
            // 받아온 데이터를 바탕으로 괘를 그리자
            drawGua(data.guaResult);
            // Q. 분명히 guaInfo를 return 했는데 어쨰서
            // guaInfo에 Promise {<pending>} 이게 저장되어 있는거지?
            return data
        })
    console.log('result');
    console.log(result);
});

function drawGua(guaInfo) {
    console.log(guaInfo);
    document.querySelector('#gua').classList.remove('hide');
    const yaoElements = document.querySelectorAll('.yao');
    const yaoSequence = guaInfo.yaoSequence
    // 1 0 1 0 1 0 이런식으로 보냐줘야 하나.. 
    console.log(yaoSequence);
    yaoElements.forEach((yao, index) => {
        setTimeout(() => {
            yao.style.opacity = 1; // 효가 보이도록 설정
            if (yaoSequence[index] === 1) {
                yao.classList.add('yang');
            } else {
                yao.innerHTML = '<div class="yin"></div><div class="yin"></div>'; // 음효(陰爻)를 위해 내부에 두 개의 선 추가
            }
        }, 200); // 각 효가 순차적으로 나타나도록 시간 간격 설정
    });
}