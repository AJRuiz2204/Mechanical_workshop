import axios from "axios";
import { getToken } from "./jwt";

const api = axios.create({
    baseURL: "http://54.197.96.169/api",
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
