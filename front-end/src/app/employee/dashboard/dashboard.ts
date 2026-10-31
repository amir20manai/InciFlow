// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// Lien de navigation
import { RouterLink } from '@angular/router';
// Services utilisés
import { IncidentService } from '../../services/incident';
import { NotificationService, NotificationResponse } from '../../services/notification';
// Modèle d'un incident
import { IncidentResponse } from '../../models/incident';

// Composant du tableau de bord de l'employé
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // Champ de recherche globale
  globalSearch: string = '';
  // Nom de l'utilisateur connecté
  userName: string = 'Alex';

  // Cartes de statistiques (Total / Rejeté / Résolu)
  metrics = [
    { title: 'Total des rapports', value: '0', iconBg: 'rgba(37, 99, 235, 0.15)', iconColor: '#3b82f6' },
    { title: 'Rejeté', value: '0', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444' },
    { title: 'Résolu', value: '0', iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#10b981' }
  ];

  // Liste des 3 derniers incidents de l'employé
  recentReports: any[] = [];
  // Liste des 5 dernières notifications
  notifications: any[] = [];

  // Injection des services et du détecteur de changements
  constructor(
    private incidentService: IncidentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    // Récupère le nom de l'utilisateur depuis le token JWT stocké
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Décodage du payload JWT (partie centrale du token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const payload = JSON.parse(jsonPayload);
        const fName = payload.firstName || '';
        const lName = payload.lastName || '';

        if (fName) {
          this.userName = `${fName} ${lName}`.trim();
        }
      } catch (e) {
        console.error('Erreur décodage token dashboard', e);
      }
    }

    this.loadDashboardData();
  }

  // Charge les données du dashboard (incidents + notifications)
  loadDashboardData(): void {
    // --- 1. Chargement des incidents et calcul des métriques ---
    this.incidentService.getMyIncidents().subscribe({
      next: (incidents: IncidentResponse[]) => {
        // Cas : aucun incident → on vide et on arrête
        if (!incidents || !Array.isArray(incidents) || incidents.length === 0) {
          this.recentReports = [];
          this.cdr.detectChanges();
          return;
        }

        // Comptage total, résolu, rejeté
        const total = incidents.length;
        const resolved = incidents.filter(i => {
          const s = String(i?.status || '').toUpperCase();
          return s === 'RESOLU' || s === 'RESOLVED';
        }).length;

        const rejected = incidents.filter(i => {
          const s = String(i?.status || '').toUpperCase();
          return s === 'REJETE' || s === 'REJECTED';
        }).length;

        // Mise à jour des cartes de statistiques
        this.metrics[0].value = total.toString();
        this.metrics[1].value = rejected.toString();
        this.metrics[2].value = resolved.toString();

        // Tri des incidents du plus récent au plus ancien
        const sortedIncidents = [...incidents].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // On garde les 3 plus récents pour l'affichage
        this.recentReports = sortedIncidents.slice(0, 3).map((inc: any) => {
          const statusStr = String(inc?.status || 'Open');
          const isRes = statusStr.toUpperCase() === 'RESOLU' || statusStr.toUpperCase() === 'RESOLVED';
          const isRej = statusStr.toUpperCase() === 'REJETE' || statusStr.toUpperCase() === 'REJECTED';

          // Traduction du statut en anglais pour l'affichage
          let displayStatus = statusStr;
          if (isRes) displayStatus = 'Resolved';
          else if (isRej) displayStatus = 'Rejected';

          return {
            code: `INC-${inc?.id || '0'}`,
            severity: inc?.priority || inc?.severity || 'Normal',
            title: inc?.title || 'No Title',
            category: inc?.categoryName || inc?.category?.name || inc?.category || 'General',
            time: this.formatTimeAgo(inc?.createdAt),
            status: displayStatus
          };
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement incidents :', err);
        this.recentReports = [];
        this.cdr.detectChanges();
      }
    });

    // --- 2. Chargement des 5 dernières notifications ---
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs: NotificationResponse[]) => {
        if (!notifs || !Array.isArray(notifs)) {
          this.notifications = [];
          this.cdr.detectChanges();
          return;
        }

        // Tri des notifications du plus récent au plus ancien
        const sortedNotifs = notifs.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // On garde les 5 plus récentes
        this.notifications = sortedNotifs.slice(0, 5).map(n => ({
          message: n.message,
          time: this.formatTimeAgo(n.createdAt),
          isRead: n.isRead
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement notifications :', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Convertit une date en texte relatif : "3h ago", "2d ago"
  formatTimeAgo(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5; // ms → heures
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    }
    return `${Math.floor(diffHours / 24)}d ago`;
  }
}