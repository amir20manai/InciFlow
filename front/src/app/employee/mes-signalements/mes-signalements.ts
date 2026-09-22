import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident';

export interface IncidentUI {
  id: number;
  code: string;
  title: string;
  category: string;
  departmentName: string;
  severity?: string;
  status?: string;
  date: string;
  rawDate?: number; // زدناها باش تسهل علينا الـ Sorting
}

@Component({
  selector: 'app-mes-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-signalements.html',
  styleUrls: ['./mes-signalements.css']
})
export class MesSignalements implements OnInit {
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';

  incidents: IncidentUI[] = [];
  
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private incidentService: IncidentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRealIncidents();
  }

  loadRealIncidents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.incidentService.getMyIncidents().subscribe({
      next: (data: any[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          this.incidents = [];
        } else {
          // 1. Mappage mta' el data
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

          // 2. Sorting: Mel Jdid lel Qdim (Descending order - الأحدث لفوق)
          this.incidents = mappedIncidents.sort((a, b) => b.rawDate - a.rawDate);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur Backend:', err);
        this.errorMessage = 'Erreur lors de la récupération des données.';
        this.isLoading = false;
        this.incidents = [];
        this.cdr.detectChanges();
      }
    });
  }

  filterIncidents(): void {
    this.cdr.detectChanges();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/employee/signalements', id]);
  }

  get filteredIncidents(): IncidentUI[] {
    if (!this.incidents) return [];
    
    return this.incidents.filter(inc => {
      const searchVal = (this.searchQuery || '').toLowerCase();
      const titleVal = (inc.title || '').toLowerCase();
      const codeVal = (inc.code || '').toLowerCase();
      
      const matchesSearch = titleVal.includes(searchVal) || codeVal.includes(searchVal);
      
      const matchesStatus = 
        this.selectedStatus === 'ALL' || 
        inc.status === this.selectedStatus;
        
      const matchesPriority = 
        this.selectedPriority === 'ALL' || 
        inc.severity === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

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