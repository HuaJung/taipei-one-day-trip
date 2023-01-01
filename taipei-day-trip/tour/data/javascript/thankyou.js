const orderNumber = new URL(window.location).searchParams.get('number');
const orderApi = new URL(`api/order/${orderNumber}`, `${window.origin}`);

loginChecker()

async function loginChecker() {
    const response = await fetch(userApi);
    const userInfo = await response.json();
    if (userInfo.data === null) {
        window.location = window.origin;
    } else {
        fetchOder();
    };
    loader();
};

async function fetchOder() {
    const response = await fetch(orderApi);
    const thanksHeader = document.querySelector('.thanks-header h2');
    if (response.status === 200) {
        const result = await response.json();
        const thanksWord = document.createTextNode(' 感謝您的訂購 ')
        thanksHeader.insertBefore(thanksWord, thanksHeader.querySelector('.fa-quote-right'));
        renderOderDetail(result);
    } else {
        const errorWord = document.createTextNode(' 尚未登入，拒絕存取 ')
        thanksHeader.insertBefore(errorWord, thanksHeader.querySelector('.fa-quote-right'));
    };
};

function loader() {
    const loader = document.querySelector('.loader');
    const container = document.querySelector('.container')
    loader.classList.remove('loader-active');
    container.style.display = 'block';
    setTimeout(() => {
        container.style.opacity = 1;
    }, 50);
};
function renderOderDetail(result){
    orderResult = result.data
    attractionInfo = result.data.trip.attraction;
    const orderNumberDiv = document.querySelector('.order-number');
    const orderStatusDiv = document.querySelector('.order-status');
    const orderInfoDiv = document.querySelector('.order-info')
    const orderImg = document.querySelector('.card-img img')
    const attractionNameLi = document.querySelector('.attraction-name');
    const dateLi = document.querySelector('.date');
    const timeLi = document.querySelector('.time');
    const costLi = document.querySelector('.cost');
    const addressLi = document.querySelector('.address');
    const orderStatus = orderResult.status === 0? '已付款': '未付款';
    const tripTime = orderResult.trip.time === 'forenoon'? '上午9時至中午12時' : '下午1時至下午5時'

    orderNumberDiv.textContent = `訂單編號：${orderResult.number}`;
    orderStatusDiv.textContent = `付款狀態：${orderStatus}`;
    orderInfoDiv.textContent = '訂單內容：'
    orderImg.setAttribute('src', attractionInfo.image)
    attractionNameLi.textContent = `${attractionInfo.name}`;
    dateLi.textContent = `日期：${orderResult.trip.date}`;
    timeLi.textContent = `時間：${tripTime}`;
    costLi.textContent = `費用：新台幣 ${orderResult.price} 元`;
    addressLi.textContent = `地點：${attractionInfo.address}`;
    
};