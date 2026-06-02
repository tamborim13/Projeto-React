import axios from 'axios';
import { BASE_URL } from '../services/config';


const api = axios.create({ baseURL: BASE_URL });

export const login = (email, senha) =>
    api.post(`/auth/login?email=${email}&senha=${senha}`);

export const cadastrar = (nome, email, senha) =>
    api.post(`/auth/cadastro?nome=${nome}&email=${email}&senha=${senha}`);

export const listarOcorrencias = () =>
    api.get('/ocorrencias/');

export const criarOcorrencia = (formData) =>
    api.post('/ocorrencias/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export default api;
export { BASE_URL };