const profileCard = document.querySelector('.card');
const skeletonTemplate = document.getElementById('skeleton');
const modifications = document.querySelectorAll('.modify');
const updateMsg = document.querySelector('.message');


getUserInfo();


async function getUserInfo() {
    const userInfo = await loginChecker();
    renderMemberPage(userInfo);
    skeletonLoader();
    modifyInfo();
    confirmModifying();
}

async function updateUserInfo(data) {
    const request = {
        'method': 'PATCH', 
        'headers': {'Content-Type': 'application/json'}, 
        'body': JSON.stringify(data)
    };
    const response = await fetch(userApi, request);
    if (response.status === 200) {
        updateMsg.style.color = 'green';
        updateMsg.textContent = '修改成功';
    } else if (response.status === 400) {
        updateMsg.textContent = '修改失敗，資料格式不正確';
    } else if (response.status === 500) {
        updateMsg.textContent = '內部伺服器，請稍後再試';
    } else {  
        updateMsg.textContent = '修改失敗，請稍後再試';
    };
}   


function renderMemberPage(userInfo) {
    const profilePic = document.createElement('img');
    const input = document.createElement('input');
    input.type = 'text';
    input.disabled = true;
    const modifySpan = document.querySelectorAll('.modify');

    profilePic.src = 'https://picsum.photos/300/200?random=1';
    profileCard.querySelector('.img').appendChild(profilePic);
    
    const nameInput = input.cloneNode(true);
    nameInput.value = userInfo.name;
    profileCard.querySelector('.name').insertBefore(nameInput, modifySpan[0]);

    const emailInput = input.cloneNode(true);
    emailInput.value = userInfo.email;
    profileCard.querySelector('.email').insertBefore(emailInput, modifySpan[1]);

    const phoneInput = input.cloneNode(true);
    phoneInput.value = userInfo.phone;
    profileCard.querySelector('.phone').insertBefore(phoneInput, modifySpan[2])

    const passwordInput = input.cloneNode(true);
    passwordInput.value =  '********'
    profileCard.querySelector('.password').insertBefore(passwordInput, modifySpan[3]);

    const button = document.createElement('button');
    button.className = 'confirm-btn';
    button.textContent = '確認修改';
    profileCard.appendChild(button);
};

function skeletonLoader() {
    const skeletons = document.querySelectorAll('.skeleton');  
    const skeletonTxts = document.querySelectorAll('.skeleton-text'); 
    const headers = document.querySelectorAll('h4');

    skeletons.forEach(skeleton => 
        skeleton.classList.remove('skeleton'));
    skeletonTxts.forEach(skeletonTxt => 
        skeletonTxt.classList.remove('skeleton-text'));
    setTimeout(()=>{
        headers.forEach(header=> header.style.opacity = 1);
        modifications.forEach(modification => modification.style.opacity = 1);
        }, 50);
}
function modifyInfo() {
    modifications.forEach((modification) => {
    modification.addEventListener('click', () => {
        const inputField = modification.parentNode.querySelector('input[type="text"]');
        inputField.disabled = false;
        inputField.style.color = 'black';
        inputField.focus();
        });
    });
}

function confirmModifying() {
    const confirmBtn = profileCard.querySelector('.confirm-btn');
    confirmBtn.addEventListener('click', () => {
        const inputFields = profileCard.querySelectorAll('input[type="text"]');
        const newName = inputFields[0].value;
        const newEmail = inputFields[1].value;
        const newPhone = inputFields[2].value? inputFields[2].value : null;
        const newPassword = inputFields[3].value === '********'? null : inputFields[3].value === false? null: inputFields[3].value;
        const bodyData = {
            'name': newName,
            'email': newEmail,
            'phone': newPhone,
            'password': newPassword
        };
        updateUserInfo(bodyData);
 
    });

}