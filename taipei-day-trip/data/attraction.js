let attractionID = window.location.pathname.split('/').pop();
let attractionAPI = new URL(`/api/attractions/${attractionID}` ,`${window.origin}`);
const datePicker = document.querySelector('#date-selection');
const today = new Date();
const carousel = document.querySelector('.carousel');
const arrowBtns = document.querySelectorAll('.arrow-button');



async function getAttraction(url) {
    try {
        const response = await fetch(url);
        const result = await response.json();
        const div = document.createElement('div');
        const fragment = document.createDocumentFragment();

        if (result.error === true) {
            const noData = div.cloneNode();
            noData.className = 'no-data'
            noData.textContent = result.message;
            fragment.appendChild(noData);
        } else {
            const title = document.querySelector('title')
            const profile = document.querySelector('.grid-profile');
            const description = document.querySelector('.description')
            const address = document.querySelector('.address')
            const transport = document.querySelector('.transport')
            const p = document.createElement('p')
            const slidesUl = document.createElement('ul');
            const carouselNavDiv = div.cloneNode();
            title.textContent = result.data.name;
            slidesUl.className = 'grid-slides';
            carouselNavDiv.className = 'carousel-nav'; 
           
            const h2 = document.createElement('h2');
            const profileP = p.cloneNode();
            
            h2.textContent = result.data.name;
            profileP.textContent = `${result.data.category} at ${result.data.mrt}`;
            profile.insertBefore(h2, profile.querySelector('.booking-form'));
            profile.insertBefore(profileP, profile.querySelector('.booking-form'));

            const descriptionP = p.cloneNode();
            descriptionP.textContent = result.data.description;
            description.appendChild(descriptionP);

            const addressP = p.cloneNode();
            addressP.textContent = result.data.address;
            address.appendChild(addressP)

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
            });
            fragment.appendChild(slidesUl);
            fragment.appendChild(carouselNavDiv);
            carousel.appendChild(fragment);  
            
        };   
    } catch(error) {
        console.log(`Error: ${error}`);
    };
};

const carouselPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const carouselDots = document.getElementsByClassName('carousel-nav')[0];
        if (carouselDots) {
            resolve(carouselDots);
        } else {
            reject(new Error('not ready yet!'));
        };
    }, 1000);
});

const moveToSlide = (slides, activeSlide, nextIndex)=> {
    slides.children[nextIndex].classList.add('active');
    activeSlide.classList.remove('active');
};

const updateDot = (carouselDots, activeDot, targetIndex) => {
    carouselDots.children[targetIndex].classList.add('active');
    activeDot.classList.remove('active');
};



getAttraction(attractionAPI)

// available date from tomorrow
today.setDate(today.getDate() + 1);
datePicker.min = today.toLocaleDateString('en-ca')
// available dates within 6 months
today.setMonth(today.getMonth() + 6)
datePicker.max = today.toLocaleDateString('en-ca')

arrowBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
    // left arrow index == 0 , right arrow index == 1
    const offset = index === 0? index-1 : 1;
    const slides = carousel.querySelector('.grid-slides');
    const activeSlide = slides.querySelector('.active');
    const carouselDots = carousel.querySelector('.carousel-nav');
    const activeDot = carouselDots.querySelector('.active')
    let nextIndex = [...slides.children].indexOf(activeSlide) + offset;
    if (nextIndex < 0) {
        nextIndex = slides.children.length-1
    } else if (nextIndex >= slides.children.length) {
        nextIndex = 0;
    };
    moveToSlide(slides, activeSlide, nextIndex);
    updateDot(carouselDots, activeDot, nextIndex);
    }, true );
})

carouselPromise.then(carouselDots => {
    carouselDots.addEventListener('click', e => {
        const slides = carousel.querySelector('.grid-slides');
        const activeSlide = slides.querySelector('.active');
        const targetDot = e.target.closest('button');
        const activeDot = carouselDots.querySelector('.active')
        const targetIndex = [... carouselDots.children].indexOf(targetDot);
        if (!targetDot) return;
        moveToSlide(slides, activeSlide, targetIndex)
        updateDot(carouselDots, activeDot, targetIndex);
    });
    
}).catch(err => console.error(err))




    







