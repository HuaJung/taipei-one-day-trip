let page = 0;
let attractionsApi = () => new URL(`${window.origin}/api/attractions?page=${page}`);  // make it a function to allow page updated
const cardWrapper = document.querySelector('.card-wrapper');
const cards = document.querySelectorAll('.card');
const loadMore = document.querySelector('.observer');
const searchInput = document.querySelector('input[type="text"]');
const searchBtn = document.querySelector('#search-btn');
let isLoading = false;


async function getItems(url) {
    try {
        isLoading = true;
        const response = await fetch(url)
        const result = await response.json()
        const fragment = document.createDocumentFragment();
        const div = document.createElement('div');

        if (result.data.length === 0 && isLoading === true) {
            const noData = div.cloneNode();
            noData.className = 'no-data'
            noData.textContent = '很抱歉無相關景點，請重新搜尋，謝謝！';
            fragment.appendChild(noData);
            
        } else if (isLoading === true) {
            result.data.forEach((attraction) => {
                const cardDiv = div.cloneNode();
                const img = document.createElement('img');
                const attractionDiv = div.cloneNode();
                const cardBodyDiv = div.cloneNode();
                const mrtDiv = div.cloneNode();
                const categoryDiv = div.cloneNode();
                
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
                cardBodyDiv.appendChild(mrtDiv);
                cardBodyDiv.appendChild(categoryDiv);
                fragment.appendChild(cardDiv);
            })};
        cardWrapper.appendChild(fragment);
        const nextPage = result.nextPage;
        sessionStorage.setItem('nextPage', nextPage);
        isLoading = false;
    } catch(error) {
        console.log(`Error: ${error}`);
    };
};


async function getCatgories() {
    try {
        const categoryApi = new URL(`${window.origin}/api/categories`);
        const response = await fetch(categoryApi);
        const result = await response.json();
        const categoryList = document.querySelector('.category-list');
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

const options = {
    root: null,
    rootMargin: '200px',
    threshold: 0
};

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        const nextPage = sessionStorage.getItem('nextPage');
        if (nextPage === 'null') return;
        page = nextPage;
        getItems(attractionsApi());
    };
}, options);

getItems(attractionsApi());
getCatgories();
observer.observe(loadMore);


// search for category
searchBtn.addEventListener('click', e => {
    e.preventDefault()
    let keyword = searchInput.value;
    if (!keyword || keyword === sessionStorage.getItem('keyword')) return;  // no keyword or same keyword provided
    page = 0;  // default keyword page
    sessionStorage.setItem('keyword', keyword)
    let keywordApi= new URL(`${window.origin}/api/attractions?page=${page}&keyword=${keyword}`); 
    while (cardWrapper.hasChildNodes()) {
        cardWrapper.removeChild(cardWrapper.firstChild);
    };
    getItems(keywordApi);
   
});


// show category list when foucs 
searchInput.addEventListener('focus', () => {
    document.querySelector('.category-list').style.display = 'block';
    const category = document.querySelectorAll('.category-list li')
    // attach the selected catogory to the search bar
    category.forEach(element => {
        element.addEventListener('mousedown', (e)=> {
            searchInput.value = e.target.textContent
    });
    });
});

// hide category list when losing focus
searchInput.addEventListener('blur', () => {
    document.querySelector('.category-list').style.display = 'none';
});

