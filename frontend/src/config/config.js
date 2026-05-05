// const host = 'http://localhost:3001/';
// const config = {
//     host: host,
//     api: host + 'api'
// }

// export default config;

const host = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1')) ? 'http://localhost:3001/' : 'https://lumincoin-finance-vjzt.onrender.com/';

const config = {
    host: host,
    api: host + 'api' // добавляем слеш, чтобы формировать /api/...
};

export default config;
