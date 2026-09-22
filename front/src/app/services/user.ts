// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service de gestion des utilisateurs
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // URL de base de l'API des utilisateurs
  private apiUrl = 'http://localhost:8080/api/users';

  // Injection du client HTTP
  constructor(private http: HttpClient) {}

  // Récupère le profil de l'utilisateur connecté
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Met à jour le profil de l'utilisateur connecté
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }

  // Change le mot de passe de l'utilisateur connecté
  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, data);
  }

  // Supprime un utilisateur (réservé à l'admin)
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/admin/users/${id}`);
  }

  // Récupère TOUS les utilisateurs (réservé à l'admin)
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/admin/users');
  }

  // Met à jour un utilisateur par son ID (réservé à l'admin)
  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/admin/users/${id}`, data);
  }
}