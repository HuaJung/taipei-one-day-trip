let attractionID = window.location.pathname.split('/').pop();
let attractionAPI = new URL(`/api/attraction/${attractionID}` ,`${window.origin}`);
const datePicker = document.querySelector('#date-selection');
const today = new Date();
const carousel = document.querySelector('.carousel');
const arrowBtns = document.querySelectorAll('.arrow-button');
const bookingBtn =document.querySelector('.booking-btn')
const bookingError = document.querySelector('.booking-error');


fetchAttraction(attractionAPI);


// available date from tomorrow
today.setDate(today.getDate() + 1);
datePicker.min = today.toLocaleDateString('en-ca');
// available dates within 6 months
today.setMonth(today.getMonth() + 6)
datePicker.max = today.toLocaleDateString('en-ca');


bookingBtn.addEventListener('click', (e) => {
    loginChecker();
    const bookingDate = datePicker.value;
    if (!bookingDate) {
        bookingError.textContent = '請選擇日期';
        return
    }
    const bookingTime = document.querySelector('input[name="time"]:checked').value;
    const bookingCost = bookingTime === 'forenoon'? 2000 : 2500;
    const bookingData =  {
        "attractionId": attractionID,
        "date": bookingDate,
        "time": bookingTime,
        "price": bookingCost
    };
    bookingTour(bookingData);
});

async function loginChecker() {
    const result = await ajax(userApi);
    if (result.data === null) {
        signinModal.showModal();  
    } else {
        return
    };
};

async function bookingTour(data) {
    const bookingApi = new URL ('/api/booking/', `${window.origin}`)
    const request = {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'body': JSON.stringify(data) 
    };
    const response = await fetch(bookingApi, request);
    if (response.status === 400) {
        bookingError.textContent = '預約失敗，請重新預約';
    } else if (response.status === 403) {
        bookingError.textContent = '尚未登入，請重新登入';
    } else if (response.status === 500) {
        bookingError.textContent = '內部伺服器，請稍後再試';
    } else {  
        window.location = `${window.origin}/booking`;
    };
};


async function fetchAttraction(url) {
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (response.status === 400) {
            const errorMsg = document.createTextNode('無相關景點')
            renderNoData(errorMsg)
        } else if (response.status === 200){
            renderAttraction(result);
            skeletonLoader();
            const carouselDots = carousel.querySelector('.carousel-nav');
            const slides = carousel.querySelector('.grid-slides');
            carouselIndicator(carouselDots, slides);
            carouselArrowBtns(carouselDots, slides);
        } else {
            const errorMsg = document.createTextNode('內部伺服器錯誤')
            renderNoData(errorMsg);
        };
    } catch(error) {
        console.log(`Error: ${error}`);
    };
};
function skeletonLoader() {
    const skeletons = document.querySelectorAll('.skeleton');  
    const skeletonTxts = document.querySelectorAll('.skeleton-text'); 
    const headers = document.querySelectorAll('h5');
    const form = document.querySelector('.booking-form form');
    skeletons.forEach(skeleton => 
        skeleton.classList.remove('skeleton'));
    skeletonTxts.forEach((skeletonTxt) => {
        if (skeletonTxt.parentNode) {
            skeletonTxt.parentNode.removeChild(skeletonTxt);
        };
    });
    headers.forEach(header => 
        header.style.display = 'block');
    form.style.display = 'block';
}
function renderNoData(errorMsg) {
    const container = document.querySelector('.container')
    const noData = document.createElement('div');
    const oppsFaceIcon = document.createElement('i');
    const p = document.createElement('p')
    oppsFaceIcon.className = 'fa-regular fa-face-dizzy'
    noData.className = 'no-data'
    p.appendChild(errorMsg);
    noData.append(oppsFaceIcon, p)
    container.innerHTML = ''
    container.appendChild(noData);
};

function renderAttraction(result) {      
    const div = document.createElement('div');
    const fragment = document.createDocumentFragment(); 
    const p = document.createElement('p')

    const title = document.querySelector('title');
    title.textContent = result.data.name;

    const h2 = document.createElement('h2');
    h2.textContent = result.data.name;

    const slidesUl = document.createElement('ul');
    slidesUl.className = 'grid-slides';

    const carouselNavDiv = div.cloneNode();
    carouselNavDiv.className = 'carousel-nav'; 

    const profile = document.querySelector('.grid-profile');
    const profileP = p.cloneNode();
    profileP.textContent = `${result.data.category} at ${result.data.mrt}`;
    profile.insertBefore(h2, profile.querySelector('.booking-form'));
    profile.insertBefore(profileP, profile.querySelector('.booking-form'));

    const description = document.querySelector('.description')
    const descriptionP = p.cloneNode();
    descriptionP.textContent = result.data.description;
    description.appendChild(descriptionP);

    const address = document.querySelector('.address')
    const addressP = p.cloneNode();
    addressP.textContent = result.data.address;
    address.appendChild(addressP)

    const transport = document.querySelector('.transport')
    const transportP = p.cloneNode();
    transportP.textContent = result.data.transport;
    transport.appendChild(transportP)


    result.data.images.forEach((image, i) => {
        const li = document.createElement('li');
        li.classList.add('slide');
        const button = document.createElement('button');
        button.classList.add('carousel-indicator');
        const img = document.createElement('img')
        slideLi = li.cloneNode(true);
        img.setAttribute('src', image)
        indicatorBtn = button.cloneNode(true);
        if (i === 0) {
            slideLi.classList.add('active');
            indicatorBtn.classList.add('active');
        };
        slideLi.appendChild(img);
        slidesUl.appendChild(slideLi);
        carouselNavDiv.appendChild(indicatorBtn);

    fragment.appendChild(slidesUl);
    fragment.appendChild(carouselNavDiv);
    carousel.appendChild(fragment); 
    });
};

function carouselIndicator(carouselDots, slides) {
    carouselDots.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        const activeSlide = slides.querySelector('.active');
        const activeDot = carouselDots.querySelector('.active')
        const targetIndex = [... carouselDots.children].indexOf(targetDot);
        if (!targetDot) return;
        moveToSlide(slides, activeSlide, targetIndex)
        updateDot(carouselDots, activeDot, targetIndex);
    });
};

function carouselArrowBtns(carouselDots, slides) {
    arrowBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
        // left arrow index == 0 , right arrow index == 1
        const offset = index === 0? index-1 : 1;
        const activeSlide = slides.querySelector('.active');
        const activeDot = carouselDots.getElementsByClassName('active')[0]
        let nextIndex = [...slides.children].indexOf(activeSlide) + offset;
        if (nextIndex < 0) {
            nextIndex = slides.children.length-1
        } else if (nextIndex >= slides.children.length) {
            nextIndex = 0;
        };
        moveToSlide(slides, activeSlide, nextIndex);
        updateDot(carouselDots, activeDot, nextIndex);
        });
    });
};

const moveToSlide = (slides, activeSlide, nextIndex)=> {
    slides.children[nextIndex].classList.add('active');
    activeSlide.classList.remove('active');
};

const updateDot = (carouselDots, activeDot, targetIndex) => {
    carouselDots.children[targetIndex].classList.add('active');
    activeDot.classList.remove('active');
};









    







