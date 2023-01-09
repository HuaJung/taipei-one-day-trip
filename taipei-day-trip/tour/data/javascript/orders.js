const orderHistoryApi = new URL ('/api/orders/history', `${window.origin}`);
const orderHistoryBtn = document.querySelector('.order-history-btn');


loginChecker();
orderHistoryBtn.addEventListener('click', fetchOrderHistory);


async function fetchOrderHistory () {
    ordersResult = await fetchAPI(orderHistoryApi);
    renderOrderHistory(ordersResult);
};

function renderOrderHistory(ordersResult) {
    const noData = document.querySelector('.no-data')
    if (ordersResult.data === null) {
        noData.textContent = '您還沒有任何訂購紀錄'
    } else if (ordersResult.error === true) {
        noData.textContent = '伺服器錯誤，請稍後再試'
    } else {
        const accordionUl = document.querySelector('.accordion')
        accordionUl.innerHTML = ''
        ordersResult.data.forEach(order => {
            const div = document.createElement('div');
            const li = document.createElement('li');
            
            const accordionBoxLi = li.cloneNode();
            accordionBoxLi.className = 'accordion-box';

            const checkboxInput = document.createElement('input');
            checkboxInput.type = 'checkbox';
            checkboxInput.id = order.number;

            const orderNoLabel = document.createElement('label');
            orderNoLabel.htmlFor = order.number;
            orderNoLabel.textContent = `訂單編號：#${order.number}`;

            const accordionContent = div.cloneNode();
            accordionContent.className = 'accordion-content';

            const orderDetailsUl = document.createElement('ul');
            orderDetailsUl.className = 'grid-order-details';

            const orderTimeLi = li.cloneNode();
            orderTimeLi.textContent = `訂單日期：${order.created_at}`;

            const paymentStatusLi = li.cloneNode();
            const orderStatus = order.status === 0? '已付款': '未付款';
            paymentStatusLi.textContent = `付款狀態：${orderStatus}`;

            const orderAttracionLi = li.cloneNode();
            orderAttracionLi.textContent =  '旅遊地點：';

            const attractionIdLink = document.createElement('a')
            attractionIdLink.href = `/attraction/${order.trip.attraction.id}`;
            attractionIdLink.textContent = order.trip.attraction.name;

            const tripDateTimeLi = li.cloneNode();
            const tripTime = order.trip.time === 'forenoon'? '上午9時至中午12時' : '下午1時至下午5時';
            tripDateTimeLi.textContent = `旅遊時間：${order.trip.date} / ${tripTime}`;

            const costLi = li.cloneNode();
            costLi.textContent = `支付金額：新台幣${order.price}元`;

            orderAttracionLi.appendChild(attractionIdLink);
            orderDetailsUl.append(orderTimeLi, paymentStatusLi, orderAttracionLi, tripDateTimeLi, costLi);

            accordionContent.appendChild(orderDetailsUl);

            accordionBoxLi.append(checkboxInput,orderNoLabel,accordionContent);

            accordionUl.appendChild(accordionBoxLi);
        });
    };
};