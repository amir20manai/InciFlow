// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Service d'authentification (login, register, gestion du token)
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL de base de l'API d'authentification
  private apiUrl = 'http://localhost:8080/api/auth';

  // Injection du client HTTP
  constructor(private http: HttpClient) {}

  // Inscription d'un nouvel utilisateur
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Connexion (authentification) d'un utilisateur existant
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate`, credentials);
  }

  // ✅ Enregistre le token JWT avec la clé 'token' (unifiée)
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // ✅ Récupère le token avec la clé 'token'
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Déconnexion : supprime le token et le rôle
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}