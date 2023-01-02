// normal fetch without parsin any status code
async function ajax(url) {
    return fetch(url).then(response => response.json());
};

// after normal fetch, get userInfo
async function loginChecker() {
    const userInfo = await ajax(userApi);
    if (userInfo.data === null) {
        window.location = window.origin;
    } else {
        return userInfo.data;
    };
};

// fetch with parsing status code
async function fetchAPI(url) {
    const response = await fetch(url);
    // not logged in status code for booking & order 
    if (response.status === 403) {
        window.location = window.origin;
    } else {
        const result = await response.json();
        return result;
    };
};

