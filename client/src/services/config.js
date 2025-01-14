import _axios from "axios";

const REACT_APP_API_URL = "http://localhost:8000";

const handleRes = (res) => {
    return res;
};

// creates new promise that is rejected with err as the reason
// error propagates as a rejection so can be caught appropriately to display user feedback
const handleErr = (err) => {
    console.log(err);
    return Promise.reject(err);
};

const api = _axios.create({ withCredentials: true });
api.interceptors.request.use(handleRes, handleErr);
api.interceptors.response.use(handleRes, handleErr);

export { REACT_APP_API_URL, api };
