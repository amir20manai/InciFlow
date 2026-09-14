import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // تسجيل حساب جديد (Register)
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // تسجيل الدخول (Authenticate)
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, credentials);
  }

  // حفظ التوكن في الـ LocalStorage باستخدام المفتاح 'auth_token'
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // جلب التوكن
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // التحقق هل اليوزر مسجل دخول أم لا
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // تسجيل الخروج
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role');
  }
}