// Importation des décorateurs et interfaces Angular nécessaires
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Importation du module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Importation du module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Importation du service de notifications et de l'interface de réponse
import { NotificationService, NotificationResponse } from '../../services/notification';

// Décorateur du composant avec ses métadonnées
@Component({
  selector: 'app-notification-admin',       // Sélecteur HTML du composant
  standalone: true,                          // Composant autonome (pas besoin de NgModule)
  imports: [CommonModule, FormsModule], // Modules importés
  templateUrl: './notification.html',        // Fichier HTML du composant
  styleUrls: ['./notification.css']          // Fichier(s) CSS du composant
})
export class NotificationAdmin implements OnInit {
  // Onglet actif : 'all' (toutes), 'unread' (non lues), 'read' (lues)
  activeTab: 'all' | 'unread' | 'read' = 'all';
  // Texte de recherche pour filtrer les notifications
  searchQuery: string = '';

  // Tableau des notifications récupérées depuis le backend
  notifications: NotificationResponse[] = [];
  // Indicateur de chargement (spinner)
  isLoading: boolean = true;
  // Message d'erreur affiché en cas de problème
  errorMessage: string = '';

  // Injection du service de notifications et du détecteur de changements
  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Méthode appelée à l'initialisation du composant
  ngOnInit(): void {
    this.loadNotifications();
  }

  // Charge les notifications depuis le service
  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        // Ajoute un type (critical, assigned, resolved, info) à chaque notification
        this.notifications = data.map(n => ({
          ...n,
          type: this.determineType(n.message)
        }));
        this.isLoading = false;
        // Force la détection de changements pour rafraîchir la vue
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.errorMessage = 'Erreur lors de la récupération des notifications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Détermine le type de notification en fonction du message
  determineType(message: string): 'critical' | 'assigned' | 'resolved' | 'info' {
    const lower = message.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
    if (lower.includes('assigned') || lower.includes('affecté')) return 'assigned';
    if (lower.includes('resolved') || lower.includes('résolu')) return 'resolved';
    return 'info';
  }

  // Getter : compte le nombre de notifications non lues
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Getter : retourne les notifications filtrées selon l'onglet actif et la recherche
  get filteredNotifications(): NotificationResponse[] {
    return this.notifications.filter(n => {
      // Vérifie si le message correspond à la recherche
      const matchesSearch = n.message.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      // Filtre selon l'onglet actif
      let matchesTab = true;
      if (this.activeTab === 'unread') matchesTab = !n.isRead;
      if (this.activeTab === 'read') matchesTab = n.isRead;

      return matchesSearch && matchesTab;
    });
  }

  // Marque une notification comme lue (appel API)
  markAsRead(id: number, event: Event): void {
    event.stopPropagation(); // Empêche la propagation de l'événement
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const item = this.notifications.find(n => n.id === id);
        if (item) item.isRead = true; // Met à jour localement
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark as read:', err)
    });
  }

  // Marque toutes les notifications comme lues
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true); // Met à jour localement
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark all as read:', err)
    });
  }

  // Change l'onglet actif
  setTab(tab: 'all' | 'unread' | 'read'): void {
    this.activeTab = tab;
  }
}