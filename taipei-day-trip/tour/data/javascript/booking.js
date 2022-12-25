const container = document.querySelector('.container');
const bookingApi = new URL ('/api/booking', `${window.origin}`);
const noData = document.querySelector('.no-data');
let fields;  // Display cvv field

loginChecker();

TPDirect.setupSDK(
    126944, 'app_8xl44RzWEKUFlLoQ1iJBWYbX9y05bGt7VCsWthLotm2DtouXs0jbyDSKjidQ',
    'sandbox'
    );


async function loginChecker() {
    const response = await fetch(userApi);
    const userInfo = await response.json();
    if (userInfo.data === null) {
        window.location = window.origin;
    } else {
        bookingData = await fetchBookingTour();
        renderBookingPage(userInfo, bookingData);
        const trashIcon = document.getElementsByClassName('fa-trash-can')[0];
        if (trashIcon) {
            trashIcon.addEventListener('click', removeBooking);
            // TapPay setup if booking is available
            tpSetUp();
            filedsUpdate();
        };
    };
};

async function fetchBookingTour() {
    const response = await fetch(bookingApi);
    if (response.status === 403) {
        window.location = window.origin;
    } else {
        const result = await response.json();
        return result.data
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
};


async function placeOrder(nameInput, emailInput, phoneInput, prime) {
    const bookingData = await fetchBookingTour();
    const bodyData = {
        'prime': prime,
        'order': {
            'price': bookingData.price,
            'trip': {
                'attraction': {
                    'id': bookingData.attraction.id,
                    'name': bookingData.attraction.name,
                    'address': bookingData.attraction.address,
                    'image': bookingData.attraction.image
                },
                'date': bookingData.date,
                'time': bookingData.time
            },
            'contact': {
                'name': nameInput.value,
                'email': emailInput.value,
                'phone': phoneInput.value
            }
        }
    };
    const request = {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'body': JSON.stringify(bodyData)
    };
    const ordersApi = new URL('api/orders', `${location.origin}`);
    const response = await fetch(ordersApi, request);
    const orderError = document.querySelector('.order-error');
    if (response.status === 200) {
        const result = await response.json()
        const orderNumber = result.data.number
        const thankyouPage = `${window.origin}/thankyou?number=${orderNumber}`;
        window.location = thankyouPage
    } else if (response.status === 400) {
        orderError.textContent = '訂單建立失敗，請檢查輸入是否正確';
    } else if (response.status === 403) {
        orderError.textContent = '尚未登入，拒絕存取';
    } else {  
        orderError.textContent = '內部伺服器，請稍後再試';
    }; 
};

function renderBookingPage(userInfo, data) {
    const username = userInfo.data.name;
    const email = userInfo.data.email;
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
        const tpDiv = div.cloneNode();
        tpDiv.className = 'tpfield';


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
        const ccNumberGroup = div.cloneNode();
        ccNumberGroup.id = 'cc-number-group';
        const ccNumberLabel = label.cloneNode();
        ccNumberLabel.textContent = '卡片號碼：';
        const ccNumber = tpDiv.cloneNode(true);
        ccNumber.id = 'card-number';
        const ccExpiredGroup = div.cloneNode();
        ccExpiredGroup.id = 'cc-expiration-group';
        const ccExpiredDateLabel = label.cloneNode();
        ccExpiredDateLabel.textContent = '過期時間：';
        const ccExpiredDate = tpDiv.cloneNode(true);
        ccExpiredDate.id = 'card-expiration-date';
        const ccvGroup = div.cloneNode();
        ccvGroup.id = 'ccv-group';
        const ccvLabel = label.cloneNode();
        ccvLabel.textContent = '驗證密碼：';
        const ccv = tpDiv.cloneNode(true);
        ccv.id = 'card-ccv';
 
        ccNumberGroup.append(ccNumberLabel, ccNumber);
        ccExpiredGroup.append(ccExpiredDateLabel, ccExpiredDate);
        ccvGroup.append(ccvLabel, ccv);
        paymentForm.append(ccNumberGroup, ccExpiredGroup, ccvGroup, br)

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
        const errorDiv = div.cloneNode();
        errorDiv.className = 'order-error';


        checkoutDiv.appendChild(sumDiv);
        checkoutDiv.appendChild(confirmBtn);

        fragment.append(cardWrap, contactWrap, paymentWrap, checkoutDiv);
        container.appendChild(fragment);
    };
};

function filedsUpdate () {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.addEventListener('click', onSubmit);
    TPDirect.card.onUpdate((update) => {
        // update.canGetPrime === true
        // -> you can call TPDirect.card.getPrime()
        if (update.canGetPrime) {
            // Enable submit Button to get Prime.
            submitButton.removeAttribute('disabled');
            submitButton.addEventListener('click', onSubmit);
        } else {
            // Disable submit Button to get prime.
            submitButton.setAttribute('disabled', true);
        }
        // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay', 'unknow']
        if (update.cardType === 'visa') {
            // handle card type visa.
        }
        // number fields is error
        if (update.status.number === 2) {
            setNumberFormGroupToError('cc-number-group');
        } else if (update.status.number === 0) {
            setNumberFormGroupToSuccess('cc-number-group');
        } else {
            setNumberFormGroupToNormal('cc-number-group');
        };
        if (update.status.expiry === 2) {
            setNumberFormGroupToError('cc-expiration-group');
        } else if (update.status.expiry === 0) {
            setNumberFormGroupToSuccess('cc-expiration-group');
        } else {
            setNumberFormGroupToNormal('cc-expiration-group');
        };
        if (update.status.ccv === 2) {
            setNumberFormGroupToError('ccv-group');
        } else if (update.status.ccv === 0) {
            setNumberFormGroupToSuccess('ccv-group');
        } else {
            setNumberFormGroupToNormal('ccv-group');
        };
    });
};

// call TDPirect.card.getPrime when user submit form to get tappay prime
function onSubmit(event) {
    event.preventDefault();
    const nameField = document.getElementById('name')
    const emailField = document.getElementById('email')
    const phoneField = document.getElementById('phone')
    emptyFieldChecker(nameField);
    emptyFieldChecker(emailField);
    emptyFieldChecker(phoneField);
    // Get TapPay Fields status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    // Check can getPrime
    if (tappayStatus.canGetPrime === false) {
        // alert('cannot get prime')
        return
    }
    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            return
        }
        const prime = result.card.prime;
        placeOrder(nameField, emailField, phoneField, prime);     
    })
}

function tpSetUp () {
    TPDirect.card.setup({
        fields: fields={
            number: {
                // css selector
                element: '#card-number',
                placeholder: '**** **** **** ****'
            },
            expirationDate: {
                // DOM object
                element: '#card-expiration-date',
                placeholder: 'MM / YY'
            },
            ccv: {
                element: '#card-ccv',
                placeholder: 'CCV'
            }
        },
        styles: {
            // Style all elements
            'input': {
                'color': 'var(--secondary-gray-50)'
            },
            // Styling ccv field
            'input.ccv': {
                'font-size': '16px'
            },
            // Styling expiration-date field
            'input.expiration-date': {
                'font-size': '16px'
            },
            // Styling card-number field
            'input.card-number': {
                'font-size': '16px'
            },
            // style focus state
            ':focus': {
                'color': 'black'
            },
            // style valid state
            '.valid': {
                'color': 'green'
            },
            // style invalid state
            '.invalid': {
                'color': 'red'
            },
        },
        // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
        isMaskCreditCardNumber: true,
        maskCreditCardNumberRange: {
            beginIndex: 6, 
            endIndex: 11
        }
    })

}
function setNumberFormGroupToError(element) {
    const ele = document.getElementById(element);
    ele.classList.add('has-error');
    ele.classList.remove('has-success');
}
function setNumberFormGroupToSuccess(element) {
    const ele = document.getElementById(element);
    ele.classList.remove('has-error');
    ele.classList.add('has-success');
}
function setNumberFormGroupToNormal(element) {
    const ele = document.getElementById(element);
    ele.classList.remove('has-error');
    ele.classList.remove('has-success');
}