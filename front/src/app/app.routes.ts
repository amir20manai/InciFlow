// Importation des outils de routage
import { Routes } from '@angular/router';

// Importation des Guards
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

// --- AUTH ---
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';

// --- ADMIN ---
import { Admin } from './admin/admin/admin';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { Signalements } from './admin/signalements/signalements';
import { Utilisateurs } from './admin/utilisateurs/utilisateurs';
import { Categories } from './admin/categories/categories';
import { Departements } from './admin/departements/departements';
import { Statistiques } from './admin/statistiques/statistiques';
import { IncidentDetails } from './admin/incident-details/incident-details';
import { ProfileAdmin } from './admin/profile/profile';
import { NotificationAdmin } from './admin/notification/notification';

// --- EMPLOYEE ---
import { Employee } from './employee/employee/employee';
import { Dashboard as EmployeeDashboard } from './employee/dashboard/dashboard';
import { NouveauSignalement } from './employee/nouveau-signalement/nouveau-signalement';
import { MesSignalements } from './employee/mes-signalements/mes-signalements';
import { Notifications } from './employee/notifications/notifications';
import { Profile } from './employee/profile/profile';
import { IncidentDetailEmployee } from './employee/incident-detail-employee/incident-detail-employee';

// --- TECHNICIEN ---
import { Technicien } from './technicien/technicien/technicien';
import { Dashboard as TechnicienDashboard } from './technicien/dashboard/dashboard';
import { Interventions } from './technicien/interventions/interventions';
import { Rapport } from './technicien/rapport/rapport';
import { Historique } from './technicien/historique/historique';


export const routes: Routes = [

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },


  // ============================================================
  // ESPACE ADMIN
  // Protégé : être connecté + rôle "admin"
  // ============================================================
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, roleGuard],   // ✅ Double protection
    data: { role: 'admin' },                // Rôle attendu
    children: [
      { path: 'dashboard',        component: AdminDashboard },
      { path: 'signalements',     component: Signalements },
      { path: 'utilisateurs',     component: Utilisateurs },
      { path: 'categories',       component: Categories },
      { path: 'departements',     component: Departements },
      { path: 'statistiques',     component: Statistiques },
      { path: 'profile',          component: ProfileAdmin },
      { path: 'signalements/:id', component: IncidentDetails },
      { path: 'notification',     component: NotificationAdmin }
    ]
  },


  // ============================================================
  // ESPACE EMPLOYEE
  // Protégé : être connecté + rôle "employee"
  // ============================================================
  {
    path: 'employee',
    component: Employee,
    canActivate: [authGuard, roleGuard],   // ✅ Double protection
    data: { role: 'employee' },             // Rôle attendu
    children: [
      { path: 'dashboard',           component: EmployeeDashboard },
      { path: 'nouveau-signalement', component: NouveauSignalement },
      { path: 'mes-signalements',    component: MesSignalements },
      { path: 'notifications',       component: Notifications },
      { path: 'profile',             component: Profile },
      { path: 'signalements/:id',    component: IncidentDetailEmployee }
    ]
  },


  // ============================================================
  // ESPACE TECHNICIEN
  // Protégé : être connecté + rôle "technician"
  // ============================================================
  {
    path: 'technicien',
    component: Technicien,
    canActivate: [authGuard, roleGuard],   // ✅ Double protection
    data: { role: 'technician' },           // Rôle attendu
    children: [
      { path: 'dashboard',     component: TechnicienDashboard },
      { path: 'interventions', component: Interventions },
      { path: 'rapport',       component: Rapport },
      { path: 'historique',    component: Historique }
    ]
  },


  // ============================================================
  // ROUTE 404 → login
  // ============================================================
  {
    path: '**',
    redirectTo: 'login'
  }
];