import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { UserService } from '../../services/user';
import { DepartmentService } from '../../services/departement';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistiques.html',
  styleUrls: ['./statistiques.css']
})
export class Statistiques implements OnInit {
  private incidentService = inject(IncidentService);
  private categorieService = inject(CategorieService);
  private userService = inject(UserService);
  private departmentService = inject(DepartmentService);
  private cdr = inject(ChangeDetectorRef);

  globalSearch: string = '';

  metrics: any[] = [];
  categoryStats: any[] = [];
  statusBreakdown: any[] = [];
  weeklyTrend: any[] = [];

  ngOnInit(): void {
    this.loadAllDataParallel();
  }

  loadAllDataParallel(): void {
    forkJoin({
      incidents: this.incidentService.getAllIncidents(),
      categories: this.categorieService.getAllCategories(),
      users: this.userService.getAllUsers(),
      departments: this.departmentService.getAllDepartments()
    }).subscribe({
      next: (res: any) => {
        console.log('=== DEBUG STATS ===', res);
        this.computeStatistics(res.incidents, res.categories, res.users, res.departments);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  computeStatistics(incidents: any[], categories: any[], users: any[], departments: any[]): void {
    // 1. Top Metrics Cards
    const priorities = ['BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE'];
    const priorityTitles: { [key: string]: string } = {
      'BASSE': 'Incidents — Basse',
      'MOYENNE': 'Incidents — Moyenne',
      'HAUTE': 'Incidents — Haute',
      'CRITIQUE': 'Incidents — Critique'
    };

    const priorityStyles: { [key: string]: { bg: string, color: string, border: string } } = {
      'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '#64748b' },
      'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '#f59e0b' },
      'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', border: '#dc2626' },
      'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d', border: '#7f1d1d' }
    };

    this.metrics = priorities.map(p => {
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

    // 2. Incidents par Catégorie (Taw el 5at yzid douba taref w mouch twil barcha)
    const colorsList = ['#2563eb', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

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

    // Ken maxCount sghir barcha (kima 1), na3tiw base akbar shwaya wala n7ottou max virtual bch el 5at maywlich 100% fel faza el sghira
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

      // 🛑 Houni el 7all: Bel pixels walla nisba s8ira 5ir barcha men 100%
      // Ken count = 0 -> 0%, ken fama 1 twali s8yra douba taref (kima 30px wela 8% max)
      let calculatedWidth = '0%';
      if (count > 0) {
        // Tnajem tcontroleer el toul bel pixels kima theb: 1 cas = 35px, 2 cas = 70px, etc. 
        // Wela t7ot max width sghir barcha kima 5% max.
        const pixelWidth = Math.min(count * 35, 120); // Ma yoftehch 120px 7ata ken el count kbir
        calculatedWidth = `${pixelWidth}px`;
      }

      return {
        name: cat.name || cat.nom || `Cat ${index + 1}`,
        count: count,
        width: calculatedWidth,
        color: colorsList[index % colorsList.length]
      };
    });

    // 3. Charge par Technicien
    const technicians = (users || []).filter((u: any) => {
      const r = (u.role || '').toString().toUpperCase();
      const roles = Array.isArray(u.roles) ? u.roles.map((x: string) => x.toUpperCase()) : [];
      return r.includes('TECH') || roles.some((x: string) => x.includes('TECH'));
    });

    this.statusBreakdown = technicians.map((tech: any) => {
      const techIncidents = (incidents || []).filter((i: any) => {
        const tId = i.technicien?.id || i.technicianId || i.techId;
        return tId && Number(tId) === Number(tech.id);
      });
      
      const name = (tech.nom && tech.prenom) ? `${tech.prenom} ${tech.nom}` : (tech.username || 'Technicien');
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
      
      return {
        label: name,
        initials: initials || 'TC',
        count: `${techIncidents.length} en cours`
      };
    });

    // 4. Par Département
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

    // Houni el tounes: Ken fama 1 incident, el liser yetla3 chwaya bark (bil pixels wala pourcentage sghir ma yoftehch 30px wala 25%)
    let calculatedHeight = '0%';
    if (deptCount > 0) {
      const pixelHeight = Math.min(deptCount * 25, 80); // Ma yoftehch 80px 7ata ken el count kbir
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