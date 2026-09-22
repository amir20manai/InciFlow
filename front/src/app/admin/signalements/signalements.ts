import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { IncidentService } from '../../services/incident';

export interface Incident {
  id: number;
  title: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  employeeEmail?: string;
  priority?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  status?: 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'REJETE';
  createdAt?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signalements.html',
  styleUrls: ['./signalements.css']
})
export class Signalements implements OnInit, OnDestroy {

  globalSearch: string = '';
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';

  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];
  private incidentSub?: Subscription;

  constructor(
    private incidentService: IncidentService,
    private cdr: ChangeDetectorRef // 👈 Zedna el ChangeDetectorRef houni
  ) {}

  ngOnInit(): void {
    this.loadIncidents();
  }

  ionViewWillEnter(): void {
    this.loadIncidents();
  }

  ngOnDestroy(): void {
    if (this.incidentSub) {
      this.incidentSub.unsubscribe();
    }
  }

  loadIncidents(): void {
    if (this.incidentSub) {
      this.incidentSub.unsubscribe();
    }

    this.incidentSub = this.incidentService.getAllIncidents().subscribe({
      next: (data: any) => {
        console.log("RESPONSE MEL BACKEND:", data);
        
        let incidentsArray: Incident[] = [];
        
        if (Array.isArray(data)) {
          incidentsArray = data;
        } else if (data && Array.isArray(data.content)) {
          incidentsArray = data.content;
        } else if (data && typeof data === 'object') {
          const foundKey = Object.keys(data).find(k => Array.isArray(data[k]));
          if (foundKey) {
            incidentsArray = data[foundKey];
          }
        }

        this.incidents = incidentsArray;
        this.filteredIncidents = [...incidentsArray];
        this.filterIncidents();
        
        // 👈 N'ajbrou Angular bech y3awed ya3mel render lel UI bel sief
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des incidents:', err);
      }
    });
  }

  filterIncidents(): void {
    if (!this.incidents || !Array.isArray(this.incidents)) {
      this.filteredIncidents = [];
      return;
    }

    this.filteredIncidents = this.incidents.filter(inc => {
      const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';
      const global = this.globalSearch ? this.globalSearch.toLowerCase().trim() : '';

      const matchQuery = !query || 
        (inc.title && inc.title.toLowerCase().includes(query)) ||
        (inc.id && inc.id.toString().toLowerCase().includes(query)) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(query));

      const matchGlobal = !global || 
        (inc.title && inc.title.toLowerCase().includes(global)) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(global));

      const matchStatus = this.selectedStatus === 'ALL' || inc.status === this.selectedStatus;
      const matchPriority = this.selectedPriority === 'ALL' || inc.priority === this.selectedPriority;

      return matchQuery && matchGlobal && matchStatus && matchPriority;
    });

    this.cdr.detectChanges();
  }

  getStatusClass(status?: string): string {
    if (!status) return '';
    switch (status) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      default: return '';
    }
  }

  getPriorityClass(priority?: string): string {
    return priority ? priority.toLowerCase() : '';
  }
}