import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';
import { NotificationService, NotificationResponse } from '../../services/notification';

@Component({
  selector: 'app-technicien-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // Infos utilisateur connecté
  userName: string = 'Utilisateur';
  userEmail: string = '';
  userRole: string = 'Technicien';
  userInitials: string = 'U';

  // Données
  allIncidents: any[] = [];
  recentHistory: any[] = [];
  notifications: any[] = [];

  // Compteurs (3 cards)
  assignedCount: number = 0;
  inProgressCount: number = 0;
  resolvedCount: number = 0;

  // Compteurs par priorité (4 cards)
  criticalCount: number = 0;
  highCount: number = 0;
  mediumCount: number = 0;
  lowCount: number = 0;

  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadDashboardData();
    this.loadNotifications();
  }

  // ============================================================
  // Profil utilisateur
  // ============================================================
  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          const fName = user.firstName || user.firstname || '';
          const lName = user.lastName || user.lastname || '';
          this.userEmail = user.email || '';
          if (user.role) {
            this.userRole = user.role;
          }

          if (fName || lName) {
            this.userName = `${fName} ${lName}`.trim();
            this.userInitials = `${fName.charAt(0)}${lName.charAt(0) || fName.charAt(1) || ''}`.toUpperCase();
          } else {
            const sub = this.userEmail.split('@')[0] || 'User';
            this.userName = sub;
            this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.userName = 'Technicien';
        this.userInitials = 'TE';
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Incidents
  // ============================================================
  loadDashboardData(): void {
    this.incidentService.getMyTechnicianIncidents().pipe(
      catchError(err => of([]))
    ).subscribe({
      next: (data: any) => {
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        this.allIncidents = list;

        // 3 compteurs
        this.assignedCount = list.filter((i: any) => (i.status || '').toUpperCase() === 'ACCEPTE').length;
        this.inProgressCount = list.filter((i: any) => (i.status || '').toUpperCase() === 'EN_COURS').length;
        this.resolvedCount = list.filter((i: any) => (i.status || '').toUpperCase() === 'RESOLU').length;

        // 4 compteurs priorité
        this.criticalCount = list.filter((i: any) => (i.priority || '').toUpperCase() === 'CRITIQUE').length;
        this.highCount = list.filter((i: any) => (i.priority || '').toUpperCase() === 'HAUTE').length;
        this.mediumCount = list.filter((i: any) => (i.priority || '').toUpperCase() === 'MOYENNE').length;
        this.lowCount = list.filter((i: any) => (i.priority || '').toUpperCase() === 'BASSE').length;

        // Historique : ghir RESOLU, 5 loulin
        this.recentHistory = list
          .filter((i: any) => (i.status || '').toUpperCase() === 'RESOLU')
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement incidents:', err);
        this.allIncidents = [];
        this.recentHistory = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Notifications
  // ============================================================
  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs: NotificationResponse[]) => {
        if (!notifs || !Array.isArray(notifs)) {
          this.notifications = [];
          this.cdr.detectChanges();
          return;
        }

        const sortedNotifs = notifs.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        this.notifications = sortedNotifs.slice(0, 5).map(n => ({
          message: n.message,
          time: this.formatTimeAgo(n.createdAt),
          isRead: n.isRead
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Formatter time ago
  // ============================================================
  formatTimeAgo(dateString?: string): string {
    if (!dateString) return 'Récemment';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Récemment';
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    if (diffHours < 1) {
      const diffMins = Math.floor(diffHours * 60);
      return `${diffMins}min ago`;
    }
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    }
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  // ============ Voir détails
  viewDetails(id: number): void {
    this.router.navigate(['/technicien/signalements', id], {
      queryParams: { from: 'dashboard' }
    });
  }
}