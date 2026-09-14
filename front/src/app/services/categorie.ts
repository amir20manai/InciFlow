import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryResponse } from '../models/categorie';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = 'http://localhost:8080/api/categories'; 

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.apiUrl);
  }

  createCategory(categoryData: { name: string; dotColor?: string }): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, categoryData: { name: string; dotColor?: string }): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}