console.log(new Date().toLocaleDateString());
console.log(new Date().toDateString());
console.log(new Date().toISOString()); // 얘를 써야겠다.
console.log(new Date().toLocaleString()); // ISO타입을 이친구로 변환해서 랜더링 해줄 것
console.log(new Date().toLocaleTimeString());
console.log(new Date().toTimeString());
console.log(new Date().getHours());
// getHours
// DB에 시간을 저장할 때 어떤 걸로 저장하는 것이 좋을까_
// Z기 븥은 UTC세계표준시?...
// 그럼 취득해서 사용자의 화면에 뿌려줄 때 시용자가 접속한 국가의 GMT기준에 따라
// 계산해서 뿌려줘야 하는건가?

console.log(new Date);
console.log(new Date(new Date().setHours(0, 0, 0)).toLocaleString());
console.log(new Date(new Date().setHours(23, 59, 59)).toLocaleString());
