import axios from "axios";

const api = axios.create({
    baseURL: "https://app2.j-benz.com/api",
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

export default api;
