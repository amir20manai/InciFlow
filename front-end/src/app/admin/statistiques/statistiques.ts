// Importation des décorateurs et fonctions Angular
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// forkJoin pour exécuter plusieurs requêtes HTTP en parallèle
import { forkJoin } from 'rxjs';
// Importation des services nécessaires
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { UserService } from '../../services/user';
import { DepartmentService } from '../../services/departement';

// Décorateur du composant statistiques
@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.html',
  styleUrls: ['./statistiques.css']
})
export class Statistiques implements OnInit {
  // Injection des services via la fonction inject()
  private incidentService = inject(IncidentService);
  private categorieService = inject(CategorieService);
  private userService = inject(UserService);
  private departmentService = inject(DepartmentService);
  private cdr = inject(ChangeDetectorRef);

  // Recherche globale (non utilisée dans le code actuel mais présente)
  globalSearch: string = '';

  // Tableaux pour stocker les données statistiques
  metrics: any[] = [];            // Cartes de métriques par priorité
  categoryStats: any[] = [];      // Statistiques par catégorie
  statusBreakdown: any[] = [];    // Charge par technicien
  weeklyTrend: any[] = [];        // Répartition par département

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadAllDataParallel();
  }

  // Charge toutes les données en parallèle avec forkJoin
  loadAllDataParallel(): void {
    forkJoin({
      incidents: this.incidentService.getAllIncidents(),
      categories: this.categorieService.getAllCategories(),
      users: this.userService.getAllUsers(),
      departments: this.departmentService.getAllDepartments()
    }).subscribe({
      next: (res: any) => {
        console.log('=== DEBUG STATS ===', res);
        // Calcule les statistiques avec les données reçues
        this.computeStatistics(res.incidents, res.categories, res.users, res.departments);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  // Calcule toutes les statistiques à partir des données brutes
  computeStatistics(incidents: any[], categories: any[], users: any[], departments: any[]): void {
    // 1. Cartes de métriques par priorité
    const priorities = ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE'];
    const priorityTitles: { [key: string]: string } = {
      'BASSE': 'Incidents — Basse',
      'MOYENNE': 'Incidents — Moyenne',
      'HAUTE': 'Incidents — Haute',
      'CRITIQUE': 'Incidents — Critique'
    };

    // Styles (couleurs, bordures) pour chaque priorité
    const priorityStyles: { [key: string]: { bg: string, color: string, border: string } } = {
      'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '#64748b' },
      'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '#f59e0b' },
      'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', border: '#dc2626' },
      'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d', border: '#7f1d1d' }
    };

    // Crée une carte de métrique pour chaque priorité
    this.metrics = priorities.map(p => {
      // Filtre les incidents ayant cette priorité
      const filtered = (incidents || []).filter((i: any) => {
        const prio = (i.priority || i.priorite || '').toString().trim().toUpperCase();
        return prio === p;
      });
      return {
        title: priorityTitles[p],
        value: `${filtered.length} Cas`,
        bg: priorityStyles[p].bg,
        color: priorityStyles[p].color,
        border: priorityStyles[p].border
      };
    });

    // 2. Incidents par catégorie
    const colorsList = ['#2563eb', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

    // Compte les incidents pour chaque catégorie
    const allCounts = (categories || []).map(cat => {
      const catId = cat.id;
      const catName = (cat.name || cat.nom || '').toString().trim().toLowerCase();
      return (incidents || []).filter((i: any) => {
        const iCatObj = i.categorie || i.category;
        const iCatId = iCatObj?.id || i.categoryId || i.catId || i.idCategorie;
        const iCatName = (iCatObj?.nom || iCatObj?.name || i.categoryName || i.categorieNom || '').toString().trim().toLowerCase();
        return (catId && iCatId && String(iCatId) === String(catId)) || (catName && iCatName && iCatName === catName);
      }).length;
    });

    // Calcule la largeur des barres en pixels (max 120px) pour éviter les barres trop longues
    const maxVal = Math.max(...allCounts, 0);
    const virtualMax = maxVal < 5 ? 5 : maxVal; 

    this.categoryStats = (categories || []).map((cat: any, index: number) => {
      const catId = cat.id;
      const catName = (cat.name || cat.nom || '').toString().trim().toLowerCase();

      const count = (incidents || []).filter((i: any) => {
        const iCatObj = i.categorie || i.category;
        const iCatId = iCatObj?.id || i.categoryId || i.catId || i.idCategorie;
        const iCatName = (iCatObj?.nom || iCatObj?.name || i.categoryName || i.categorieNom || '').toString().trim().toLowerCase();

        const matchById = catId && iCatId && String(iCatId) === String(catId);
        const matchByName = catName && iCatName && iCatName === catName;

        return matchById || matchByName;
      }).length;

      // Calcule la largeur en pixels (1 cas = 35px, max 120px)
      let calculatedWidth = '0%';
      if (count > 0) {
        const pixelWidth = Math.min(count * 35, 120);
        calculatedWidth = `${pixelWidth}px`;
      }

      return {
        name: cat.name || cat.nom || `Cat ${index + 1}`,
        count: count,
        width: calculatedWidth,
        color: colorsList[index % colorsList.length]
      };
    });

    // 3. Charge par technicien
    // Filtre les utilisateurs ayant un rôle de technicien
    const technicians = (users || []).filter((u: any) => {
      const r = (u.role || '').toString().toUpperCase();
      const roles = Array.isArray(u.roles) ? u.roles.map((x: string) => x.toUpperCase()) : [];
      return r.includes('TECH') || roles.some((x: string) => x.includes('TECH'));
    });

    // Pour chaque technicien, compte les incidents qui lui sont assignés
    this.statusBreakdown = technicians.map((tech: any) => {
      const techIncidents = (incidents || []).filter((i: any) => {
        const tId = i.technicien?.id || i.technicianId || i.techId;
        return tId && Number(tId) === Number(tech.id);
      });
      
      // Construit le nom complet et les initiales
      const name = (tech.nom && tech.prenom) ? `${tech.prenom} ${tech.nom}` : (tech.username || 'Technicien');
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
      
      return {
        label: name,
        initials: initials || 'TC',
        count: `${techIncidents.length} en cours`
      };
    });

    // 4. Répartition par département
    const deptCounts = (departments || []).map(dept => {
      const deptId = dept.id;
      const deptName = (dept.name || dept.nom || '').toString().trim().toLowerCase();
      return (incidents || []).filter((i: any) => {
        const iDeptObj = i.departement || i.department;
        const iDeptId = iDeptObj?.id || i.departementId || i.departmentId;
        const iDeptName = (iDeptObj?.nom || iDeptObj?.name || i.departmentName || '').toString().trim().toLowerCase();
        return (deptId && iDeptId && String(iDeptId) === String(deptId)) || (deptName && iDeptName && iDeptName === deptName);
      }).length;
    });

    const maxDeptVal = Math.max(...deptCounts, 0);

    // Calcule la hauteur des barres en pixels (max 80px) pour chaque département
    this.weeklyTrend = (departments || []).map((dept: any, idx: number) => {
      const deptId = dept.id;
      const deptName = (dept.name || dept.nom || '').toString().trim().toLowerCase();

      const deptCount = (incidents || []).filter((i: any) => {
        const iDeptObj = i.departement || i.department;
        const iDeptId = iDeptObj?.id || i.departementId || i.departmentId;
        const iDeptName = (iDeptObj?.nom || iDeptObj?.name || i.departmentName || '').toString().trim().toLowerCase();

        const matchById = deptId && iDeptId && String(iDeptId) === String(deptId);
        const matchByName = deptName && iDeptName && iDeptName === deptName;

        return matchById || matchByName;
      }).length;

      // Calcule la hauteur en pixels (1 cas = 25px, max 80px)
      let calculatedHeight = '0%';
      if (deptCount > 0) {
        const pixelHeight = Math.min(deptCount * 25, 80);
        calculatedHeight = `${pixelHeight}px`;
      }

      return {
        day: dept.name || dept.nom || `Dept ${idx + 1}`,
        count: deptCount,
        height: calculatedHeight
      };
    });
  }
}