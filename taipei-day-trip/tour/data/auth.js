const openModal = document.querySelector('.auth');
const signinModal = document.querySelector('.signin');
const signupModal = document.querySelector('.signup');
const signupLink = document.querySelector('#signup');
const signinLink = document.querySelector('#signin');
const closeSignin = document.querySelector('#close-signin');
const closeSignup = document.querySelector('#close-signup');
const signinBtn = document.querySelector('#signin-btn');
const signupBtn = document.querySelector('#signup-btn');
const emailInput = document.querySelectorAll('input[type="email"]');
const passwordInput = document.querySelectorAll('input[type="password"]')
const nameInput = document.querySelector('input[type="text"]');
const userApi = new URL(`/api/user/auth` ,`${window.origin}`);
const errorMsg = document.querySelectorAll('.error');
var nameRegEx = /^(?!\s)(?![\s\S]*\s$)[^\n0-9_!¡?÷?¿\/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,75}$/;
var usernameRegEx = /^[\S]{2,30}$/;
var emailRegEx =  /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;


signupLink.addEventListener('click', () => {
    signupModal.showModal();
    signinModal.close();
});
signinLink.addEventListener('click', () => {
    signinModal.showModal();
    signupModal.close();
});
closeSignin.addEventListener('click', () => {
    signinModal.close();
    errorMsg[0].textContent=''
});
closeSignup.addEventListener('click', () => {
    signupModal.close();
    errorMsg[1].textContent=''
});

loginStatusChecker(userApi);

signinBtn.addEventListener('click', e => {
    e.preventDefault();
    if (emailInput[0].value && passwordInput[0].value) {
        const data = {
            "email": emailInput[0].value,
            "password": passwordInput[0].value
         };
         login(data)
    } else {
        if (!emailInput[0].value){
            emailInput[0].setCustomValidity('此欄必填');
        }
        if (!passwordInput[0].value){
            passwordInput[0].setCustomValidity('此欄必填');
        }
        emailInput[0].reportValidity();
        passwordInput[0].reportValidity();

    };
});

signupBtn.addEventListener('click', e => {
    e.preventDefault();
    if (nameInput.value && emailInput[1].value && passwordInput[1].value) {
        const data = {
            "name": nameInput.value,
            "email": emailInput[1].value,
            "password": passwordInput[1].value
        };
        register(data);
    } else {
        if (!nameInput.value){
            nameInput.setCustomValidity('此欄必填');
        }
        if (!emailInput[1].value){
            emailInput[1].setCustomValidity('此欄必填');
        }
        if (!passwordInput[1].value){
            passwordInput[1].setCustomValidity('此欄必填');
        }
        nameInput.reportValidity();
        emailInput[1].reportValidity();
        passwordInput[1].reportValidity();
    };
    
});

async function register(data){
    const registerApi = new URL(`/api/user` ,`${window.origin}`);
    const request = {'method': 'POST', 'headers': {'Content-Type': 'application/json'}, 'body': JSON.stringify(data)}
    response = await fetch(registerApi, request);
    if (response.status === 200) {
        errorMsg[1].style.color = 'green'
        errorMsg[1].textContent = '恭喜註冊成功！請重新登入';
    } else if (response.status === 400) {
        errorMsg[1].textContent = '此郵箱已註冊，請重新登入';
    } else if (response.status === 500) {
        errorMsg[1].textContent = '內部伺服器，請稍後再試';
    } else {  
        errorMsg[1].textContent = '註冊失敗，請稍後再試';
    };
}
async function login(data){
    const request = {'method': 'PUT','headers': {'Content-Type': 'application/json'},'body': JSON.stringify(data)}
    response = await fetch(userApi, request);
    if (response.status === 200) {
        location.reload();
    } else if (response.status === 400) {
        errorMsg[0].textContent = '登入失敗，帳號或密碼錯誤';
    } else if (response.status === 500) {
        errorMsg[0].textContent = '內部伺服器，請稍後再試';
    } else {
        errorMsg[0].textContent = '登入失敗，請重新登入';
    };

};

async function loginStatusChecker(url){
    response = await fetch(url);
    result = await response.json();
    if (result.data !== null) {
        openModal.className = 'signout';
        openModal.textContent = '登出系統';
        const signout = document.querySelector('.signout');
        signout.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
        
    } else {
        openModal.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            popout(signinModal);
        });
    };
}

async function logout() {
    response = await fetch(userApi, {'method': 'DELETE'})
    result = response.json()
    if (result.ok === true) {
        document.cookie = 'token=; Max-Age=-1';
    };
    location.reload()
}
function popout(element) {
    element.showModal();
}

function nameValidator(){
    userName = nameInput.value
    if (nameRegEx.test(userName) === false) {
        nameInput.setCustomValidity('請勿空白或用特殊字元');
    } else if (!userName) {
        nameInput.setCustomValidity('名字不能為空白');
    } else {
        nameInput.setCustomValidity('');
    };
};

function passwordValidator(input){       
    password = input.value;
    if (password.indexOf(' ') >= 0|| password.length < 4 || password.lenght > 25) {
        input.setCustomValidity('密碼須為4-25字元，且不含空格')
    } else if (password === null) {
        input.setCustomValidity('密碼不能為空白')
    } else {  
        input.setCustomValidity('');
    };
}

function emailValidator(input){
    email = input.value;
    if (emailRegEx.test(email) === false) {
        input.setCustomValidity('郵箱個是不正確');
    } else if (email === null) {
        input.setCustomValidity('郵箱不能為空白')
    }else {
        input.setCustomValidity('');
    };
}
