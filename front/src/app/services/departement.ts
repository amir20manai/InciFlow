import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id?: number;
  name: string;
  membersCount: number;
  headName: string;
  headInitials?: string;
  headColor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  constructor(private http: HttpClient) {}

  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  createDepartment(payload: { name: string; headName: string }): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, payload);
  }

  updateDepartment(id: number, payload: { name: string; headName: string }): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, payload);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}