async function fetchAPI(url) {
    const response = await fetch(url);
    if (response.status === 403) {
        window.location = window.origin;
    } else {
        const result = await response.json();
        return result.data
    };
};
