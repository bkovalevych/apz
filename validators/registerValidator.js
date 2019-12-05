module.exports = (nickname, email, password) => {
    return new Promise((resolve, reject) =>{
        if (!nickname) {
            reject('nickname required');
        }
        if (!email) {
            reject('email required');
        }
        if (!password) {
            reject('password required');
        }
        if (!validateEmail(email)) {
            reject("Email validation not passed")
        }

        if (nickname.length > 30 || nickname.length < 4) {
            reject("Length of nickname must be less than 30 and bigger than 3");
        }
        let re = new RegExp("^[a-zA-Z0-9_]+$");
        let test = re.test(nickname);
        if (!test)
            reject('Nickname should consist only symbols and numbers');

        if (password.length > 30 || password.length < 5) {
            reject("Length of password must be less than 30 and bigger than 4");
        }
        resolve('passed');
    })
};

function validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}