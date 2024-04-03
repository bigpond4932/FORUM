let isFormSubmitted = false;
document.getElementById('drawGua').addEventListener('click', async function (e) {
    // 일단 form요청하는 거 멈춰봐
    console.log('isFormSubmitted: ' + isFormSubmitted);
    e.preventDefault();
    if (isFormSubmitted) {
        return;
    }
    isFormSubmitted = true;
    let defaultTitle = `오늘 학습할 괘는?`;
    let title = document.querySelector('#question-input').value || defaultTitle; // 0이 된다고?
    console.log(`title : ${title}`);
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
            if (!data.result) {
                // 내일 다시 시도헤 주세요
                return console.log(data.message);
            }
            let result = data.guaResult;
            // img를 안보이게 하기
            document.querySelector('img').classList.add('d-none');
            // 받아온 데이터를 바탕으로 괘를 그리자
            drawGua(result);
            // Q. 분명히 guaInfo를 return 했는데 어쨰서
            // guaInfo에 Promise {<pending>} 이게 저장되어 있는거지?

            // 괘 정보를 생성
            let guaNum = result.guaInfo.guaNum;
            let guaName = result.guaInfo.guaName;
            let upTriName = result.trigramInfo.up;
            let downTriName = result.trigramInfo.down;
            let guaMeaning = result.guaInfo.guaMeaning;
            let guaInfo = `${guaNum} : ${upTriName}${downTriName} ${guaName}`;
            document.querySelector('#guaInfo').insertAdjacentHTML('beforeend',
                `<h2 style="text-align: center;">${guaInfo}</h2><p style="text-align: center;">${guaMeaning}</p>`);

            // 관련 정보 링크 띄우기
            let paddedNum = String(guaNum).padStart(2, '0');
            let url = `https://ekikyo.net/64ka/${paddedNum}.html`;
            // form사라지게 하기
            document.querySelector('.form').style.display = 'none';
            document.querySelector('.card-body').insertAdjacentHTML('beforeend',
                `<h4 class="mb-2">${title}<a href="${url}" class=" badge bg-primary-subtle text-primary-emphasis rounded-pill">Info</a></h4>`
            )
            // document.querySelector('#related').href = `https://ekikyo.net/64ka/${paddedNum}.html`;
            // document.querySelector('#related').innerHTML = '관련정보';
            return;
        })
});

function drawGua(guaInfo) {
    console.log('### draw gua ###');
    document.querySelector('.result-row').classList.remove('d-none');
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
