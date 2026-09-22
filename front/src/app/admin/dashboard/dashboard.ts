// Importation des décorateurs et utilitaires Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de routage pour la navigation et les liens
import { Router, RouterLink } from '@angular/router';
// forkJoin pour exécuter plusieurs requêtes en parallèle, of pour créer un observable de secours
import { forkJoin, of } from 'rxjs';
// catchError pour gérer les erreurs sans interrompre les autres requêtes
import { catchError } from 'rxjs/operators';
// Importation des services nécessaires
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { DepartmentService } from '../../services/departement';
import { UserService } from '../../services/user';
import { NotificationService, NotificationResponse } from '../../services/notification';
// Importation des modèles
import { IncidentResponse } from '../../models/incident';
import { CategoryResponse } from '../../models/categorie';

// Incident enrichi avec des champs prêts pour l'affichage dans le tableau du dashboard
interface DashboardIncident extends IncidentResponse {
  category: string;              // Nom de la catégorie
  department: string;            // Nom du département
  reporterName: string;          // Nom du déclarant
  reporterInitials: string;      // Initiales du déclarant (pour l'avatar)
  reporterColor: string;         // Couleur de l'avatar
  updatedAt: string;             // Date formatée pour l'affichage
}

// Composant admin : tableau de bord principal avec statistiques, graphiques et notifications
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  // Informations de l'utilisateur connecté
  userName: string = 'Utilisateur';
  userEmail: string = '';
  userRole: string = 'Administrator';
  userInitials: string = 'U';

  // Données du dashboard
  incidents: DashboardIncident[] = [];       // 5 incidents les plus récents
  categoriesList: CategoryResponse[] = [];   // Liste des catégories
  departmentsList: any[] = [];                // Liste des départements
  notifications: any[] = [];                  // 5 notifications les plus récentes

  // Cartes de statistiques affichées en haut du dashboard, initialisées à zéro
  stats: any[] = [
    { title: 'Total Incidents', count: 0, change: 'All', isPositive: true, type: 'total' },
    { title: 'Critique', count: 0, change: 'Priority', isPositive: false, type: 'critical' },
    { title: 'Haute', count: 0, change: 'Priority', isPositive: false, type: 'high' },
    { title: 'Moyenne', count: 0, change: 'Priority', isPositive: true, type: 'medium' },
    { title: 'Basse', count: 0, change: 'Priority', isPositive: true, type: 'low' }
  ];

  // Données pour le graphique par catégorie
  categories: any[] = [];
  categorySegments: any[] = [];  // Segments SVG du donut chart par catégorie

  // Compteurs par statut
  statusCounts = { open: 0, inProgress: 0, resolved: 0, rejected: 0, total: 0 };
  // Segments du graphique en anneau (donut) par statut, exprimés en propriétés SVG stroke-dasharray/offset
  statusSegments = {
    openDash: '0 238.7', openOffset: '0',
    progressDash: '0 238.7', progressOffset: '0',
    resolvedDash: '0 238.7', resolvedOffset: '0',
    rejectedDash: '0 238.7', rejectedOffset: '0'
  };

  // Injection des services nécessaires
  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private categorieService: CategorieService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadUserProfile();      // Charge le profil utilisateur
    this.loadDashboardData();    // Charge les données du dashboard
    this.loadNotifications();    // Charge les notifications
  }

  // Charge les informations de l'utilisateur connecté pour l'affichage (nom, initiales, rôle)
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
            // Cas normal : prénom et/ou nom disponibles
            this.userName = `${fName} ${lName}`.trim();
            this.userInitials = `${fName.charAt(0)}${lName.charAt(0) || fName.charAt(1) || ''}`.toUpperCase();
          } else {
            // Si aucun nom n'est renseigné, on utilise la partie avant @ de l'email comme nom d'affichage
            const sub = this.userEmail.split('@')[0] || 'User';
            this.userName = sub;
            this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading profile in dashboard:', err);
        this.userName = 'User';
        this.userInitials = 'US';
        this.cdr.detectChanges();
      }
    });
  }

  // Normalise différents formats de réponse API (tableau direct, { content: [...] }, { data: [...] }, etc.)
  // en un simple tableau JavaScript, quel que soit le format renvoyé par le backend
  private extractArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.content)) return res.content;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && typeof res === 'object') {
      // Cherche la première propriété qui est un tableau
      const arrayKey = Object.keys(res).find(k => Array.isArray(res[k]));
      if (arrayKey) return res[arrayKey];
    }
    return [];
  }

  // Charge en parallèle incidents, catégories et départements, puis prépare les données du dashboard
  loadDashboardData(): void {
    forkJoin({
      // catchError permet de continuer même si une requête échoue
      incidents: this.incidentService.getAllIncidents().pipe(catchError(err => of([]))),
      categories: this.categorieService.getAllCategories().pipe(catchError(err => of([]))),
      departments: this.departmentService.getAllDepartments().pipe(catchError(err => of([])))
    }).subscribe({
      next: (res: any) => {
        this.categoriesList = this.extractArray(res.categories);
        this.departmentsList = this.extractArray(res.departments);

        const rawData = this.extractArray(res.incidents);

        // Enrichit chaque incident avec des champs prêts à l'affichage
        const mappedIncidents = rawData.map((inc: any) => ({
          ...inc,
          category: inc.categoryName || inc.category?.name || 'General',
          department: inc.departmentName || inc.department?.name || 'IT Department',
          reporterName: inc.employeeEmail || inc.reporterName || 'Employee',
          reporterInitials: this.getInitials(inc.employeeEmail || inc.reporterName || 'E'),
          reporterColor: '#2563eb',
          updatedAt: inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : 'Recent'
        })) as DashboardIncident[];

        // Tri du plus récent au plus ancien
        const sortedIncidents = mappedIncidents.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // On ne garde que les 5 incidents les plus récents pour le tableau du dashboard
        this.incidents = sortedIncidents.slice(0, 5);

        // Calcule les statistiques à partir de TOUS les incidents triés
        this.calculateDashboardData(sortedIncidents);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }

  // Charge les 5 notifications les plus récentes, triées de la plus récente à la plus ancienne
  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs: NotificationResponse[]) => {
        if (!notifs || !Array.isArray(notifs)) {
          this.notifications = [];
          this.cdr.detectChanges();
          return;
        }

        // Tri par date décroissante
        const sortedNotifs = notifs.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // Ne garde que les 5 premières et formate le message
        this.notifications = sortedNotifs.slice(0, 5).map(n => ({
          message: n.message,
          time: this.formatTimeAgo(n.createdAt),
          isRead: n.isRead
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Convertit une date en texte relatif simple ("3h ago", "2d ago")
  formatTimeAgo(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5; // 36e5 = 1000 * 60 * 60
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    }
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  // Calcule toutes les données dérivées nécessaires à l'affichage : compteurs par priorité,
  // répartition par catégorie et segments des graphiques en anneau (par statut et par catégorie)
  calculateDashboardData(allIncidents: DashboardIncident[]): void {
    const totalCount = allIncidents.length;

    // Comptage par priorité
    const critiqueCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'CRITIQUE').length;
    const hauteCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'HAUTE').length;
    const moyenneCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'MOYENNE' || i.priority?.toString().toUpperCase() === 'MEDIUM').length;
    const basseCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'BASSE' || i.priority?.toString().toUpperCase() === 'LOW').length;

    // Met à jour les cartes de statistiques
    this.stats = [
      { title: 'Total Incidents', count: totalCount, change: 'All', isPositive: true, type: 'total' },
      { title: 'Critique', count: critiqueCount, change: 'Priority', isPositive: false, type: 'critical' },
      { title: 'Haute', count: hauteCount, change: 'Priority', isPositive: false, type: 'high' },
      { title: 'Moyenne', count: moyenneCount, change: 'Priority', isPositive: true, type: 'medium' },
      { title: 'Basse', count: basseCount, change: 'Priority', isPositive: true, type: 'low' }
    ];

    // On ne considère que les incidents des 30 derniers jours pour la répartition par catégorie
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIncidents = allIncidents.filter(inc => {
      if (!inc.createdAt) return true; // Garde les incidents sans date
      return new Date(inc.createdAt) >= thirtyDaysAgo;
    });

    const categoryMap: { [key: string]: { count: number; color: string } } = {};
    const defaultColors = ['#2563eb', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#a855f7', '#64748b', '#ec4899', '#14b8a6'];

    // Initialise chaque catégorie connue à 0, avec une couleur définie ou une couleur par défaut cyclique
    this.categoriesList.forEach((cat: any, index: number) => {
      const catName = typeof cat === 'string' ? cat : (cat.name || 'General');
      const catColor = (typeof cat === 'object' && (cat.dotColor || cat.color || cat.couleur)) || defaultColors[index % defaultColors.length];

      categoryMap[catName] = { count: 0, color: catColor };
    });

    // Comptabilise les incidents récents par catégorie
    recentIncidents.forEach(inc => {
      const catName = inc.category || 'General';
      if (categoryMap[catName] !== undefined) {
        categoryMap[catName].count++;
      } else {
        // Catégorie non répertoriée : on l'ajoute avec une couleur par défaut
        categoryMap[catName] = { count: 1, color: '#2563eb' };
      }
    });

    // Transforme la map en tableau pour l'affichage
    this.categories = Object.keys(categoryMap).map(catName => {
      return {
        name: catName,
        count: categoryMap[catName].count,
        color: categoryMap[catName].color
      };
    });

    // Comptage global par statut, en tolérant plusieurs variantes de valeurs backend
    let open = 0, inProgress = 0, resolved = 0, rejected = 0;
    allIncidents.forEach(inc => {
      const st = (inc.status || '').toUpperCase();
      if (st === 'NOUVEAU' || st.includes('OPEN')) open++;
      else if (st === 'EN_COURS' || st.includes('PROGRESS')) inProgress++;
      else if (st === 'RESOLU' || st.includes('RESOLVED')) resolved++;
      else if (st === 'REJETE' || st.includes('REJECTED') || st.includes('REJ')) rejected++;
    });

    this.statusCounts = { open, inProgress, resolved, rejected, total: totalCount };

    // Calcule les segments SVG du donut chart "par statut" : chaque portion est définie par sa longueur
    // (stroke-dasharray) et son décalage cumulé (stroke-dashoffset), en fonction de la circonférence du cercle
    const circumference = 238.7; // Circonférence du cercle SVG (2 * π * rayon)
    if (totalCount > 0) {
      const resolvedLen = (resolved / totalCount) * circumference;
      const progressLen = (inProgress / totalCount) * circumference;
      const openLen = (open / totalCount) * circumference;
      const rejectedLen = (rejected / totalCount) * circumference;

      this.statusSegments = {
        resolvedDash: `${resolvedLen} ${circumference}`,
        resolvedOffset: '0',
        progressDash: `${progressLen} ${circumference}`,
        progressOffset: `-${resolvedLen}`,
        openDash: `${openLen} ${circumference}`,
        openOffset: `-${resolvedLen + progressLen}`,
        rejectedDash: `${rejectedLen} ${circumference}`,
        rejectedOffset: `-${resolvedLen + progressLen + openLen}`
      };
    }

    // Même logique de segments pour le donut chart "par catégorie"
    let currentCatOffset = 0;
    this.categorySegments = this.categories.map(cat => {
      const len = totalCount > 0 ? (cat.count / totalCount) * circumference : 0;
      const offset = currentCatOffset;
      currentCatOffset += len; // Cumule les décalages
      return {
        color: cat.color,
        dash: `${len} ${circumference}`,
        offset: `-${offset}`
      };
    });
  }

  // Génère des initiales (max 2 lettres) à partir d'un nom ou d'un email
  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  }
}