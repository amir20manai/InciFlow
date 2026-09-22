// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// Lien de navigation
import { RouterLink } from '@angular/router';
// Service des notifications
import { NotificationService, NotificationResponse } from '../../services/notification';

// Composant : liste des notifications pour l'employé
@Component({
  selector: 'app-employee-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {
  // Onglet actif : toutes / non lues / lues
  activeTab: 'all' | 'unread' | 'read' = 'all';
  // Champ de recherche
  searchQuery: string = '';
  // Filtre par catégorie/type de notification
  selectedCategory: string = '';

  // Liste des notifications
  notifications: NotificationResponse[] = [];
  // État de chargement
  isLoading: boolean = true;
  // Message d'erreur
  errorMessage: string = '';

  // Injection des services
  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadNotifications();
  }

  // Charge les notifications depuis le backend
  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        // Ajoute un type à chaque notification (critical, assigned, resolved, info)
        this.notifications = data.map(n => ({
          ...n,
          type: this.determineType(n.message)
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement notifications :', err);
        this.errorMessage = 'Erreur lors de la récupération des notifications.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Détermine le type d'une notification à partir de son message
  determineType(message: string): 'critical' | 'assigned' | 'resolved' | 'info' {
    const lower = message.toLowerCase();
    if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
    if (lower.includes('assigned') || lower.includes('affecté')) return 'assigned';
    if (lower.includes('resolved') || lower.includes('résolu')) return 'resolved';
    return 'info';
  }

  // Getter : nombre de notifications non lues
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Getter : notifications filtrées (recherche + onglet + catégorie)
  get filteredNotifications(): NotificationResponse[] {
    return this.notifications.filter(n => {
      // Recherche dans le message
      const matchesSearch = n.message.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Filtre selon l'onglet actif
      let matchesTab = true;
      if (this.activeTab === 'unread') matchesTab = !n.isRead;
      if (this.activeTab === 'read') matchesTab = n.isRead;

      // Filtre selon la catégorie sélectionnée
      let matchesCategory = true;
      if (this.selectedCategory) {
        matchesCategory = n.type === this.selectedCategory;
      }

      return matchesSearch && matchesTab && matchesCategory;
    });
  }

  // Marque une notification comme lue
  markAsRead(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const item = this.notifications.find(n => n.id === id);
        if (item) item.isRead = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark as read :', err)
    });
  }

  // Marque toutes les notifications comme lues
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur mark all as read :', err)
    });
  }

  // Change l'onglet actif
  setTab(tab: 'all' | 'unread' | 'read'): void {
    this.activeTab = tab;
  }
}