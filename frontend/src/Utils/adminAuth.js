export const setAdminAuth = (token, admin) => {
  localStorage.setItem('admin_token', token);
  localStorage.setItem('admin', JSON.stringify(admin));
};

export const getAdminToken = () => localStorage.getItem('admin_token');

export const getAdmin = () => {
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
};

export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const admin = getAdmin();
  console.log('isAdminAuthenticated - token:', !!token);
  console.log('isAdminAuthenticated - admin:', admin);
  return token && admin && admin.role === 'admin';
};

export const adminLogout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin');
};