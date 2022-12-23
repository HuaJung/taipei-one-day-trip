const container = document.querySelector('.container');
const bookingApi = new URL ('/api/booking', `${window.origin}`);
const noData = document.querySelector('.no-data');

loginChecker()

async function loginChecker() {
    const response = await fetch(userApi);
    const result = await response.json();
    if (result.data === null) {
        window.location = window.origin;
    } else {
        fetchBookingTour(result);
    };

};

async function fetchBookingTour(userInfo) {
    username = userInfo.data.name;
    email = userInfo.data.email;
    const response = await fetch(bookingApi);
    if (response.status === 403) {
        window.location = window.origin;
    } else {
        const result = await response.json();
        const bookingData = result.data;
        renderBookingPage(username, email, bookingData);
        const trashIcon = document.getElementsByClassName('fa-trash-can')[0];
        if (trashIcon) {
            trashIcon.addEventListener('click', () => {
            removeBooking();
            });
        }
    };
};

function renderBookingPage(username, email, data) {
    const div = document.createElement('div');
    const greeting = document.querySelector('.greeting');
    const greetingName = greeting.querySelector('span');
    greetingName.textContent = username[0].toUpperCase() + username.slice(1);
    if (data === null) {
        noData.textContent = '目前沒有任何待預定的行程';
    } else {
        const fragment = document.createDocumentFragment();
        const h4 = document.createElement('h4');
        const h3 = document.createElement('h3')
        const wrap = div.cloneNode();
        wrap.className='wrap';
        const br = document.createElement('br')
        const form = document.createElement('form');
        form.className = 'grid-form';
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.required = true;
        const inputText = input.cloneNode(true);
        inputText.type = 'text';
        const inputTel = input.cloneNode(true);
        inputTel.type = 'tel' ;

        // booking card warpper
        const cardWrap = wrap.cloneNode(true);
        const cardDiv = div.cloneNode();
        cardDiv.className = 'grid-card';
        const cardImg = div.cloneNode();
        cardImg.className = 'card-img';
        const img = document.createElement('img');
        img.setAttribute('src', data.attraction.image);
        const cardInfoDiv = div.cloneNode();
        cardInfoDiv.className = 'grid-card-info';
        const attractionHeader = h4.cloneNode();
        attractionHeader.textContent = `台北一日遊： ${data.attraction.name}`;
        const dateDiv = div.cloneNode();
        dateDiv.textContent += `日期：${data.date}`;
        const timeDiv = div.cloneNode();
        timeDiv.textContent = data.time === 'forenoon'? '時間：上午9時至中午12時' : '時間：下午1時至下午5時';
        const costDiv = div.cloneNode();
        costDiv.textContent = `費用：新台幣 ${data.price} 元`;
        const addressDiv = div.cloneNode();
        addressDiv.textContent = `地點：${data.attraction.address}`;
        const trashIcon = document.createElement('i')
        trashIcon.className = 'fa-solid fa-trash-can';

        cardImg.appendChild(img);
        cardInfoDiv.appendChild(attractionHeader);
        cardInfoDiv.appendChild(dateDiv);
        cardInfoDiv.appendChild(timeDiv);
        cardInfoDiv.appendChild(costDiv);
        cardInfoDiv.appendChild(addressDiv)
        cardInfoDiv.appendChild(trashIcon);
        cardDiv.appendChild(cardImg);
        cardDiv.appendChild(cardInfoDiv);
        cardWrap.appendChild(cardDiv);

        // contact wrapper
        const contactWrap = wrap.cloneNode(true)
        const contactDiv = div.cloneNode();
        contactDiv.className = 'grid-contact'
        const contactHeader = h3.cloneNode();
        contactHeader.textContent = '您的聯絡資訊';
        const contactForm = form.cloneNode(true);
        const nameLabel =label.cloneNode();
        nameLabel.textContent = '聯絡姓名：';
        const nameInput = inputText.cloneNode(true);
        nameInput.id = 'name';
        nameInput.value = username;
        const emailLabel = label.cloneNode();
        emailLabel.textContent = '連絡信箱：';
        const emailInput = input.cloneNode(true);
        emailInput.type = 'email';
        emailInput.id = 'email';
        emailInput.value = email;
        const phoneLabel = label.cloneNode();
        phoneLabel.textContent = '手機號碼：'
        const phoneInput = inputTel.cloneNode(true);
        phoneInput.id = 'phone';
        const reminder = div.cloneNode();
        reminder.textContent = '請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式';
        
        nameLabel.appendChild(nameInput);
        emailLabel.appendChild(emailInput);
        phoneLabel.appendChild(phoneInput);
        contactForm.append(nameLabel, br, emailLabel, br, phoneLabel, br);

        contactDiv.appendChild(contactHeader);
        contactDiv.appendChild(contactForm);
        contactWrap.appendChild(contactDiv);

        // payment warpper
        const paymentWrap = wrap.cloneNode(true);
        const paymentDiv = div.cloneNode();
        paymentDiv.className = 'grid-payment';
        const paymentHeader = h3.cloneNode();
        paymentHeader.textContent = '信用卡付款資訊';
        const paymentForm = form.cloneNode(true)
        const ccardLabel = label.cloneNode();
        ccardLabel.textContent = '卡片號碼：';
        const ccardInput = inputTel.cloneNode(true);
        ccardInput.id = 'card-number';
        ccardInput.inputmode = 'numeric';
        ccardInput.placeholder = '**** **** **** ****';
        ccardInput.pattern = '[0-9\s]{13,19}';
        const expiredLabel = label.cloneNode();
        expiredLabel.textContent = '過期時間：';
        const expiredInput = inputText.cloneNode(true);
        expiredInput.id = 'expired-date';
        expiredInput.placeholder = 'MM / YY';
        expiredInput.pattern = "(?:0[1-9]|1[0-2])/[0-9]{2}";
        const cvvLabel = label.cloneNode();
        cvvLabel.textContent = '驗證密碼：';
        const cvvInput = inputTel.cloneNode(true);
        cvvInput.id = 'cvv';
        cvvInput.inputmode = 'numeric';
        cvvInput.maxlength = '3';
        cvvInput.minlength = '3';
        cvvInput.placeholder = 'CVV';

        ccardLabel.appendChild(ccardInput);
        expiredLabel.appendChild(expiredInput);
        cvvLabel.appendChild(cvvInput);
        paymentForm.append(ccardLabel, br, expiredLabel, br, cvvLabel,br)

        paymentDiv.appendChild(paymentHeader);
        paymentDiv.appendChild(paymentForm);
        paymentWrap.appendChild(paymentDiv);

        // checkout
        const checkoutDiv = div.cloneNode();
        checkoutDiv.className = 'checkout';
        const sumDiv = div.cloneNode();
        sumDiv.className = 'sum'
        sumDiv.textContent = `總價：新台幣 ${data.price} 元`
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn';
        confirmBtn.type = 'submit';
        confirmBtn.textContent = '確認訂單並付款';

        checkoutDiv.appendChild(sumDiv);
        checkoutDiv.appendChild(confirmBtn);

        fragment.append(cardWrap, contactWrap, paymentWrap, checkoutDiv)
        container.appendChild(fragment)

    };

};

async function removeBooking () {
    const response = await fetch(
        bookingApi, 
        {'method': 'DELETE'}
        )
    const result = await response.json();
    if (result.ok === true) {
        location.reload()
    } else {
        noData.textContent = '尚未登入，拒絕存取';
    };


}