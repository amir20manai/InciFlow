// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Modèle de réponse d'une catégorie
import { CategoryResponse } from '../models/categorie';

// Service de gestion des catégories d'incidents
@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  // URL de base de l'API des catégories
  private apiUrl = 'http://localhost:8080/api/categories';

  // Injection du client HTTP
  constructor(private http: HttpClient) {}

  // Récupère toutes les catégories
  getAllCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.apiUrl);
  }

  // Crée une nouvelle catégorie (nom + couleur optionnelle)
  createCategory(categoryData: { name: string; dotColor?: string }): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.apiUrl, categoryData);
  }

  // Met à jour une catégorie existante
  updateCategory(id: number, categoryData: { name: string; dotColor?: string }): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, categoryData);
  }

  // Supprime une catégorie par son ID
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}