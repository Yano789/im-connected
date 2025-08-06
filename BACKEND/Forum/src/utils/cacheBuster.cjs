const addCacheBuster = (url) => {
    if (!url) return url;
    const cb = Date.now();
    return url.includes('?') ? `${url}&cb=${cb}` : `${url}?cb=${cb}`;
};


module.exports = addCacheBuster