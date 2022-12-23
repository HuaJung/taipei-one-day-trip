let observer;
let keyword;
let page = 0;
let isLoading = false;
let baseApi = new URL(`${window.origin}/api/attractions`);
const cardWrapper = document.querySelector('.card-wrapper');
const cards = document.querySelectorAll('.card');
const categoryList = document.querySelector('.category-list');
const searchInput = document.querySelector('#search-bar');
const searchBtn = document.querySelector('#search-btn');


const options = {
    root: null,
    rootMargin: '100px',
    threshold: 1
};

observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting >= 0.5 && isLoading === false ) {
        baseApi.searchParams.set('page', page);
        if (keyword) {
            baseApi.searchParams.set('keyword', keyword);
        };
        isLoading = true;
        getItems(baseApi);
    };
}, options);


async function getItems(url) {
    try {
        const response = await fetch(url);
        const result = await response.json();
        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');

        if (result.data.length === 0 && isLoading === true) {
            const noData = div.cloneNode();
            noData.className = 'no-data'
            noData.textContent = '很抱歉無相關景點，請重新搜尋，謝謝！';
            fragment.appendChild(noData);
            
        } else {
            result.data.forEach(attraction => {
                const a = document.createElement('a')
                const cardDiv = div.cloneNode();
                const img = document.createElement('img');
                const attractionDiv = div.cloneNode();
                const cardBodyDiv = div.cloneNode();
                const mrtDiv = div.cloneNode();
                const categoryDiv = div.cloneNode();
                
                a.href = `/attraction/${attraction.id}`
                cardDiv.className = 'card';
                img.src = attraction.images[0];
                attractionDiv.className = 'attraction-name';
                attractionDiv.textContent = attraction.name;
                cardBodyDiv.className = 'card-body';
                mrtDiv.className = 'mrt';
                mrtDiv.textContent = attraction.mrt;
                categoryDiv.className = 'category';
                categoryDiv.textContent = attraction.category;

                cardDiv.appendChild(img);
                cardDiv.appendChild(attractionDiv);
                cardDiv.appendChild(cardBodyDiv);
                a.appendChild(cardDiv);
                cardBodyDiv.appendChild(mrtDiv);
                cardBodyDiv.appendChild(categoryDiv);
                fragment.appendChild(a);
            })};
        cardWrapper.appendChild(fragment);
        if (!result.nextPage) {
            isLoading = true;
            keyword = ''  //reset keyword
        } else {
            page = result.nextPage;
            isLoading = false;
        }
        observer.observe(cardWrapper.lastChild)

    } catch(error) {
        console.log(`Error: ${error}`);
    };
};


async function getCatgories() {
    try {
        const categoryApi = new URL(`${window.origin}/api/categories`);
        const response = await fetch(categoryApi);
        const result = await response.json();
        const categoryUl = document.createElement('ul');
        result.data.forEach(category => {
            const categoryLi = document.createElement('li');
            category = document.createTextNode(category);
            categoryLi.appendChild(category);
            categoryUl.appendChild(categoryLi);
        });
        categoryList.append(categoryUl);
        categoryList.style.display = 'none';
    } catch(error) {
        console.log(`Error: ${error}`);
    };
};


// search for category
searchBtn.addEventListener('click', e => {
    e.preventDefault()
    keyword = searchInput.value;
    if (!keyword) return;  // no keyword 
    page = 0;  // default keyword page
    baseApi.searchParams.set('page', page);    
    baseApi.searchParams.set('keyword', keyword)
    while (cardWrapper.hasChildNodes()) {
        cardWrapper.removeChild(cardWrapper.firstChild);
    };
    isLoading = true;
    getItems(baseApi);
});


// show category list when foucs 
searchInput.addEventListener('focus', () => {
    categoryList.style.display = 'block';
    // attach the selected catogory to the search bar
    categoryList.addEventListener('mousedown', e => {
        const targetCategory = e.target.closest('li');
        if (!targetCategory) return;
        searchInput.value = targetCategory.textContent;
    }, true);
});

// hide category list when losing focus
searchInput.addEventListener('blur', () => {
    document.querySelector('.category-list').style.display = 'none';
});


baseApi.searchParams.set('page', page);
getItems(baseApi);
getCatgories();
