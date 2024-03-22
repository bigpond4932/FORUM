document.getElementById('drawGua').addEventListener('click', function() {
    const yaoElements = document.querySelectorAll('.yao');
    const yaoSequence = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
    // 1 0 1 0 1 0 이런식으로 보냐줘야 하나.. 

    yaoElements.forEach((yao, index) => {
        setTimeout(() => {
            yao.style.opacity = 1; // 효가 보이도록 설정
            if (yaoSequence[index] === 'yang') {
                yao.classList.add('yang');
            } else {
                yao.innerHTML = '<div class="yin"></div><div class="yin"></div>'; // 음효(陰爻)를 위해 내부에 두 개의 선 추가
            }
        }, 1000); // 각 효가 순차적으로 나타나도록 시간 간격 설정
    });
});
