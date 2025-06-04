import axios from "axios";
import { getToken } from "./jwt";

const api = axios.create({
    baseURL: "http://localhost:5121/api", // http://localhost:5121/api // https://api2.j-benz.com
});

// Agregamos interceptor para incluir el token en cada petición
api.interceptors.request.use(config => {
    const token = getToken();
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Added interceptor for logging Axios errors
api.interceptors.response.use(
    response => response,
    error => {
        console.error("AxiosError intercepted:", error);
        return Promise.reject(error);
    }
);

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

export default api;
