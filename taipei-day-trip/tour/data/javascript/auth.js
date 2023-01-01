const signinModal = document.querySelector('.signin');
const signupModal = document.querySelector('.signup');
const signupLink = document.querySelector('#signup');
const signinLink = document.querySelector('#signin');
const closeSignin = document.querySelector('#close-signin');
const closeSignup = document.querySelector('#close-signup');
const signinBtn = document.querySelector('#signin-btn');
const signupBtn = document.querySelector('#signup-btn');
const userApi = new URL(`/api/user/auth` ,`${window.origin}`);
const errorMsg = document.querySelectorAll('.auth-error');
const loginTab = document.querySelector('.auth');
const bookingTab = document.querySelector('.booking');


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

loginTabChecker();

signinBtn.addEventListener('click', e => {
    e.preventDefault();
    const loginEmail = document.querySelectorAll('input[type="email"]')[0];
    const loginPassword = document.querySelectorAll('input[type="password"]')[0];

    emptyFieldChecker(loginEmail);
    emptyFieldChecker(loginPassword);
    
    if (loginEmail.value && loginPassword.value) {
        console.log(loginEmail.value);
        const data = {
            "email": loginEmail.value,
            "password": loginPassword.value
            };
            login(data);
    };
});

signupBtn.addEventListener('click', e => {
    e.preventDefault();
    const registerName = document.querySelector('input[type="text"]');
    const registerEmail = document.querySelectorAll('input[type="email"]')[1];
    const registerPassword = document.querySelectorAll('input[type="password"]')[1];
    
    emptyFieldChecker(registerName);
    emptyFieldChecker(registerEmail);
    emptyFieldChecker(registerPassword);

    if (registerName.value && registerEmail.value && registerPassword.value) {
        const data = {
            "name": registerName.value,
            "email": registerEmail.value,
            "password": registerPassword.value
        };
        register(data);
    };
});

async function ajax(url) {
    return fetch(url).then(response => response.json());
};

async function loginTabChecker(){
    const result = await ajax(userApi);
    if (result.data !== null) {
        loginTab.parentNode.removeChild(loginTab);
        renderMemberMenu();
        expandMenu()
        signoutAction();
        bookingAccess();
    } else {
        showLoginModal(loginTab);
        showLoginModal(bookingTab);
    };
};

async function register(data){
    const registerApi = new URL(`/api/user` ,`${window.origin}`);
    const request = {
        'method': 'POST', 
        'headers': {'Content-Type': 'application/json'}, 
        'body': JSON.stringify(data)
    };
    const response = await fetch(registerApi, request);
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
};

async function login(data){
    const request = {
        'method': 'PUT',
        'headers': {'Content-Type': 'application/json'},'body': JSON.stringify(data)
    };
    const response = await fetch(userApi, request);
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

async function logout() {
    const response = await fetch(userApi, {'method': 'DELETE'})
    const result = await response.json();
    if (result.ok === true) {
        location.reload()
    };
};

function showLoginModal(element) {
    element.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        signinModal.showModal();
    });
};

function signoutAction() {
    const logoutTab = document.querySelector('.signout');
    logoutTab.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        logout();
    });
};

function bookingAccess(){
    bookingTab.addEventListener('click', e => {
        e.preventDefault();
        window.location = `${window.origin}/booking`
    });
};

function emptyFieldChecker(input) {
    if (!input.value){
        input.setCustomValidity('此欄必填');
        input.reportValidity()
    } else {
        input.setCustomValidity('')
    };
};

function renderMemberMenu() {   
    const navItems= document.querySelector('.navitems');
    const navUl = document.querySelector('.navitems ul')

    const memberMenudiv = document.createElement('div');
    memberMenudiv.className = 'member-menu';

    const menuUl = document.createElement('ul');
    menuUl.className = 'menu-items'
    const li = document.createElement('li');

    const orderHistoryli = li.cloneNode();
    const link = document.createElement('a');
    link.href = '/member/orders';
    link.textContent = '訂單查詢';
    orderHistoryli.appendChild(link);

    const signoutLi = li.cloneNode();
    signoutLi.className = 'signout';
    signoutLi.textContent = '會員登出';

    const memebershipLi = li.cloneNode();
    memebershipLi.className = 'membership';
    memebershipLi.textContent = '會員中心';

    menuUl.append(orderHistoryli, signoutLi);
    memberMenudiv.appendChild(menuUl);
    navUl.appendChild(memebershipLi);
    navItems.appendChild(memberMenudiv);
};

function expandMenu() {
    const memberMenu = document.querySelector('.member-menu');
    const membership = document.querySelector('.membership');
    membership.addEventListener('click', () => {
        memberMenu.classList.toggle('expand-toggle');
    });
};