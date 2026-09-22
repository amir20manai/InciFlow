// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// Routage
import { Router, RouterLink } from '@angular/router';
// Service des incidents
import { IncidentService } from '../../services/incident';

// Interface représentant un incident côté UI
export interface IncidentUI {
  id: number;
  code: string;
  title: string;
  category: string;
  departmentName: string;
  severity?: string;
  status?: string;
  date: string;
  rawDate?: number; // Date brute (timestamp) pour faciliter le tri
}

// Composant : liste des signalements de l'employé connecté
@Component({
  selector: 'app-mes-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-signalements.html',
  styleUrls: ['./mes-signalements.css']
})
export class MesSignalements implements OnInit {
  // Champ de recherche
  searchQuery: string = '';
  // Filtre par statut
  selectedStatus: string = 'ALL';
  // Filtre par priorité
  selectedPriority: string = 'ALL';

  // Liste des incidents
  incidents: IncidentUI[] = [];

  // État de chargement
  isLoading: boolean = true;
  // Message d'erreur
  errorMessage: string = '';

  // Injection des services
  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadRealIncidents();
  }

  // Charge les incidents de l'employé depuis le backend
  loadRealIncidents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.incidentService.getMyIncidents().subscribe({
      next: (data: any[]) => {
        // Cas : aucune donnée
        if (!data || !Array.isArray(data) || data.length === 0) {
          this.incidents = [];
        } else {
          // Transformation des données pour l'affichage
          const mappedIncidents = data.map(inc => {
            const depName = inc?.departmentName || inc?.department?.name || inc?.department || 'General';
            const rawDateValue = inc?.createdAt || inc?.date;

            return {
              id: inc?.id || 0,
              code: `INC-${inc?.id || '0'}`,
              title: inc?.title || 'No Title',
              category: inc?.categoryName || inc?.category?.name || inc?.category || 'General',
              departmentName: depName,
              severity: inc?.priority || inc?.severity || 'MOYENNE',
              status: inc?.status || 'NOUVEAU',
              date: this.formatDate(rawDateValue),
              rawDate: rawDateValue ? new Date(rawDateValue).getTime() : 0
            };
          });

          // Tri du plus récent au plus ancien
          this.incidents = mappedIncidents.sort((a, b) => b.rawDate - a.rawDate);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur backend :', err);
        this.errorMessage = 'Erreur lors de la récupération des données.';
        this.isLoading = false;
        this.incidents = [];
        this.cdr.detectChanges();
      }
    });
  }

  // Force la détection de changement (appelé depuis le template)
  filterIncidents(): void {
    this.cdr.detectChanges();
  }

  // Formate une date au format "jj mois aaaa" (français)
  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Navigue vers la page de détails
  viewDetails(id: number): void {
    this.router.navigate(['/employee/signalements', id]);
  }

  // Getter : liste des incidents filtrés selon la recherche et les filtres
  get filteredIncidents(): IncidentUI[] {
    if (!this.incidents) return [];

    return this.incidents.filter(inc => {
      const searchVal = (this.searchQuery || '').toLowerCase();
      const titleVal = (inc.title || '').toLowerCase();
      const codeVal = (inc.code || '').toLowerCase();

      // Recherche par titre ou code
      const matchesSearch = titleVal.includes(searchVal) || codeVal.includes(searchVal);

      // Filtre par statut
      const matchesStatus =
        this.selectedStatus === 'ALL' ||
        inc.status === this.selectedStatus;

      // Filtre par priorité
      const matchesPriority =
        this.selectedPriority === 'ALL' ||
        inc.severity === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  // Retourne la classe CSS du badge de statut
  getStatusClass(status?: string): string {
    if (!status) return 'open';
    switch (status.toUpperCase()) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      default: return 'open';
    }
  }

  // Retourne la classe CSS du badge de priorité
  getPriorityClass(priority?: string): string {
    if (!priority) return 'medium';
    switch (priority.toUpperCase()) {
      case 'CRITIQUE': return 'critical';
      case 'HAUTE': return 'high';
      case 'MOYENNE': return 'medium';
      case 'BASSE': return 'low';
      default: return 'medium';
    }
  }
}