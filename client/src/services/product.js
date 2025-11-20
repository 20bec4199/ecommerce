import API from './api';

export const getAllProducts = () => API.get('/products');

export const updateProduct = ({data, productId}) => API.put(`/products/${productId}`, {data});

export const deleteProduct = (productId) => API.delete(`/products/${productId}`);