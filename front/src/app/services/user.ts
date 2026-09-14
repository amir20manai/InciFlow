import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }
  // حذف مستخدم بواسطة الأدمين
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/admin/users/${id}`);
  }

  // زيد هذي هون:
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/admin/users');
  }
}