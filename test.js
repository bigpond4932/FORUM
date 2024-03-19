// console.log(user.username); => error

// var username = user.username; => error

// 즉 존재하지 않는 개체의 필드값을 참조할 때 not defined 에러가 난다. 500

var req = {user: {}}
console.log(req.user.username); // error는 안남 undifned