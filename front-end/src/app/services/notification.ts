// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface représentant une notification
export interface NotificationResponse {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  // Type de notification (optionnel, déduit du message côté front)
  type?: 'critical' | 'assigned' | 'resolved' | 'info';
}

// Service de gestion des notifications
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // URL de base de l'API des notifications
  private apiUrl = 'http://localhost:8080/api/notifications';

  // Injection du client HTTP
  constructor(private http: HttpClient) {}

  // Récupère les notifications de l'utilisateur connecté
  getMyNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.apiUrl);
  }

  // Marque une notification spécifique comme lue
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  // Marque TOUTES les notifications comme lues
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {});
  }
}