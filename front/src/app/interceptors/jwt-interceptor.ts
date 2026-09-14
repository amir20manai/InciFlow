import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  console.log('Interception - Token found in localStorage:', token); // 👈 حط السطر هذا
  
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  } else {
    console.warn('Interception - No token found! Request sent without Authorization.');
  }

  return next(req);
};