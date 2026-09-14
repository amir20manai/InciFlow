import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt-interceptor'; // ثبت في المسار الصحيح وين حطيت ملف الـ interceptor متاعك

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])) // <--- هذي هي الإضافة المهمة اللي تخلي الأنجولار يبعث التوكن وحدو
  ]
};