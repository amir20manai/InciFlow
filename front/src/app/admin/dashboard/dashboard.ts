import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { DepartmentService } from '../../services/departement';
import { UserService } from '../../services/user';
import { NotificationService, NotificationResponse } from '../../services/notification'; // زيدناها
import { IncidentResponse } from '../../models/incident';
import { CategoryResponse } from '../../models/categorie';

interface DashboardIncident extends IncidentResponse {
  category: string;
  department: string;
  reporterName: string;
  reporterInitials: string;
  reporterColor: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userName: string = 'Utilisateur';
  userEmail: string = '';
  userRole: string = 'Administrator';
  userInitials: string = 'U';

  incidents: DashboardIncident[] = [];
  categoriesList: CategoryResponse[] = [];
  departmentsList: any[] = [];
  notifications: any[] = []; // زدناها

  stats: any[] = [
    { title: 'Total Incidents', count: 0, change: 'All', isPositive: true, type: 'total' },
    { title: 'Critique', count: 0, change: 'Priority', isPositive: false, type: 'critical' },
    { title: 'Haute', count: 0, change: 'Priority', isPositive: false, type: 'high' },
    { title: 'Moyenne', count: 0, change: 'Priority', isPositive: true, type: 'medium' },
    { title: 'Basse', count: 0, change: 'Priority', isPositive: true, type: 'low' }
  ];

  categories: any[] = [];
  categorySegments: any[] = [];

  statusCounts = { open: 0, inProgress: 0, resolved: 0, rejected: 0, total: 0 };
  statusSegments = {
    openDash: '0 238.7', openOffset: '0',
    progressDash: '0 238.7', progressOffset: '0',
    resolvedDash: '0 238.7', resolvedOffset: '0',
    rejectedDash: '0 238.7', rejectedOffset: '0'
  };

  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private categorieService: CategorieService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private notificationService: NotificationService, // زدناها
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadDashboardData();
    this.loadNotifications(); // زدناها
  }

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
        console.error('Error loading profile in dashboard:', err);
        this.userName = 'User';
        this.userInitials = 'US';
        this.cdr.detectChanges();
      }
    });
  }

  private extractArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.content)) return res.content;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && typeof res === 'object') {
      const arrayKey = Object.keys(res).find(k => Array.isArray(res[k]));
      if (arrayKey) return res[arrayKey];
    }
    return [];
  }

  loadDashboardData(): void {
    forkJoin({
      incidents: this.incidentService.getAllIncidents().pipe(catchError(err => of([]))),
      categories: this.categorieService.getAllCategories().pipe(catchError(err => of([]))),
      departments: this.departmentService.getAllDepartments().pipe(catchError(err => of([])))
    }).subscribe({
      next: (res: any) => {
        this.categoriesList = this.extractArray(res.categories);
        this.departmentsList = this.extractArray(res.departments);

        const rawData = this.extractArray(res.incidents);

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

        // حصر الجدول في أحدث 5 تقارير فقط
        this.incidents = sortedIncidents.slice(0, 5);

        this.calculateDashboardData(sortedIncidents);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }

  // جلب أحدث 5 تنبيهات مرتبة من الأجدد للقديم
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
        console.error('Error fetching notifications:', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  }

  formatTimeAgo(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    }
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  calculateDashboardData(allIncidents: DashboardIncident[]): void {
    const totalCount = allIncidents.length;

    const critiqueCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'CRITIQUE').length;
    const hauteCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'HAUTE').length;
    const moyenneCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'MOYENNE' || i.priority?.toString().toUpperCase() === 'MEDIUM').length;
    const basseCount = allIncidents.filter(i => i.priority?.toString().toUpperCase() === 'BASSE' || i.priority?.toString().toUpperCase() === 'LOW').length;

    this.stats = [
      { title: 'Total Incidents', count: totalCount, change: 'All', isPositive: true, type: 'total' },
      { title: 'Critique', count: critiqueCount, change: 'Priority', isPositive: false, type: 'critical' },
      { title: 'Haute', count: hauteCount, change: 'Priority', isPositive: false, type: 'high' },
      { title: 'Moyenne', count: moyenneCount, change: 'Priority', isPositive: true, type: 'medium' },
      { title: 'Basse', count: basseCount, change: 'Priority', isPositive: true, type: 'low' }
    ];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentIncidents = allIncidents.filter(inc => {
      if (!inc.createdAt) return true;
      return new Date(inc.createdAt) >= thirtyDaysAgo;
    });

    const categoryMap: { [key: string]: { count: number; color: string } } = {};
    const defaultColors = ['#2563eb', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#a855f7', '#64748b', '#ec4899', '#14b8a6'];

    this.categoriesList.forEach((cat: any, index: number) => {
      const catName = typeof cat === 'string' ? cat : (cat.name || 'General');
      const catColor = (typeof cat === 'object' && (cat.dotColor || cat.color || cat.couleur)) || defaultColors[index % defaultColors.length];
      
      categoryMap[catName] = { count: 0, color: catColor };
    });

    recentIncidents.forEach(inc => {
      const catName = inc.category || 'General';
      if (categoryMap[catName] !== undefined) {
        categoryMap[catName].count++;
      } else {
        categoryMap[catName] = { count: 1, color: '#2563eb' };
      }
    });

    this.categories = Object.keys(categoryMap).map(catName => {
      return {
        name: catName,
        count: categoryMap[catName].count,
        color: categoryMap[catName].color
      };
    });

    let open = 0, inProgress = 0, resolved = 0, rejected = 0;
    allIncidents.forEach(inc => {
      const st = (inc.status || '').toUpperCase();
      if (st === 'NOUVEAU' || st.includes('OPEN')) open++;
      else if (st === 'EN_COURS' || st.includes('PROGRESS')) inProgress++;
      else if (st === 'RESOLU' || st.includes('RESOLVED')) resolved++;
      else if (st === 'REJETE' || st.includes('REJECTED') || st.includes('REJ')) rejected++;
    });

    this.statusCounts = { open, inProgress, resolved, rejected, total: totalCount };

    const circumference = 238.7; 
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

    let currentCatOffset = 0;
    this.categorySegments = this.categories.map(cat => {
      const len = totalCount > 0 ? (cat.count / totalCount) * circumference : 0;
      const offset = currentCatOffset;
      currentCatOffset += len;
      return {
        color: cat.color,
        dash: `${len} ${circumference}`,
        offset: `-${offset}`
      };
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  }
}