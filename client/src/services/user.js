import API from './api';

export const userAPI = {
    // Profile
    getProfile: () => API.get('/users/profile'),
    updateProfile: (data) => API.put('/users/profile', data),
    updatePassword: (data) => API.put('/users/password', data),
    uploadAvatar: (formData) => API.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
    // Addresses
    getAddresses: () => API.get('/users/addresses'),
    addAddress: (data) => API.post('/users/addresses', data),
    updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
    deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  
    // Seller
    createSellerProfile: (data) => API.post('/users/seller/profile', data),
    updateSellerProfile: (data) => API.put('/users/seller/profile', data),
    getSellerDashboard: () => API.get('/users/seller/dashboard'),
  };
  
  export default userAPI;