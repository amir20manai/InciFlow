import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentService } from '../../services/incident';

@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interventions.html',
  styleUrl: './interventions.css',
})
export class Interventions implements OnInit {
  interventions: any[] = [];
  filteredInterventions: any[] = [];
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInterventions();
  }

  // ============================================================
  // Charger les interventions (filtrer RESOLU/REJETE côté front)
  // ============================================================
  loadInterventions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.incidentService.getMyTechnicianIncidents().subscribe({
      next: (data) => {
        console.log('Data mel backend:', data);

        // Filtre : on garde uniquement ACCEPTE et EN_COURS
        this.interventions = (data || []).filter((inc: any) =>
          inc.status !== 'RESOLU' && inc.status !== 'REJETE'
        );

        this.filteredInterventions = [...this.interventions];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = "Erreur lors du chargement des interventions.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Filtres (Recherche + Statut + Priorité)
  // ============================================================
  filterInterventions(): void {
    const q = this.searchQuery.toLowerCase();

    this.filteredInterventions = this.interventions.filter((inc) => {
      // Filtre : RESOLU et REJETE exclus
      if (inc.status === 'RESOLU' || inc.status === 'REJETE') {
        return false;
      }

      const matchesSearch =
        inc.title?.toLowerCase().includes(q) ||
        ('INC-' + inc.id).toLowerCase().includes(q) ||
        inc.categoryName?.toLowerCase().includes(q);

      const matchesStatus =
        this.selectedStatus === 'ALL' || inc.status === this.selectedStatus;

      const matchesPriority =
        this.selectedPriority === 'ALL' || inc.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  // ============================================================
  // Naviguer vers les détails (avec paramètre "from")
  // ============================================================
  viewDetails(id: number): void {
    this.router.navigate(['/technicien/signalements', id], {
      queryParams: { from: 'interventions' }
    });
  }

  // ============================================================
  // Classes CSS pour les badges
  // ============================================================
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACCEPTE': return 'badge-status accepted';
      case 'EN_COURS': return 'badge-status in-progress';
      case 'NOUVEAU': return 'badge-status open';
      case 'RESOLU': return 'badge-status resolved';
      case 'REJETE': return 'badge-status rejected';
      default: return 'badge-status';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'CRITIQUE': return 'badge-priority critical';
      case 'HAUTE': return 'badge-priority high';
      case 'MOYENNE': return 'badge-priority medium';
      case 'BASSE': return 'badge-priority low';
      default: return 'badge-priority';
    }
  }
}