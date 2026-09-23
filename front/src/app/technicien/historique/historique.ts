import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentService } from '../../services/incident';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique.html',
  styleUrl: './historique.css',
})
export class Historique implements OnInit {
  interventions: any[] = [];
  filteredInterventions: any[] = [];
  searchQuery: string = '';
  selectedPriority: string = 'ALL';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  // ============================================================
  //  Load History 
  // ============================================================
  loadHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.incidentService.getMyTechnicianIncidents().subscribe({
      next: (data) => {
        console.log(' Data mel backend:', data);

        //  FILTRE FI EL FRONT: ghir RESOLU
        this.interventions = (data || []).filter((inc: any) =>
          inc.status === 'RESOLU'
        );

        this.filteredInterventions = [...this.interventions];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(' Erreur:', err);
        this.errorMessage = "Erreur lors du chargement de l'historique.";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  //  Filtres (Recherche + Priorité)
  // ============================================================
  filterInterventions(): void {
    const q = this.searchQuery.toLowerCase();

    this.filteredInterventions = this.interventions.filter((inc) => {
      //  FILTRE: ghir RESOLU
      if (inc.status !== 'RESOLU') {
        return false;
      }

      const matchesSearch =
        inc.title?.toLowerCase().includes(q) ||
        ('INC-' + inc.id).toLowerCase().includes(q) ||
        inc.categoryName?.toLowerCase().includes(q);

      const matchesPriority =
        this.selectedPriority === 'ALL' || inc.priority === this.selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }

  viewDetails(id: number): void {
  this.router.navigate(['/technicien/signalements', id], {
    queryParams: { from: 'historique' }
  });
}

  // ============================================================
  //  Classes CSS
  // ============================================================
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