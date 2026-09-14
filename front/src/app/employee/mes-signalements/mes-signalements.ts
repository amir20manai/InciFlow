import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident';

interface IncidentUI {
  code: string;
  title: string;
  category: string;
  reportedBy: string;
  severity: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-mes-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-signalements.html',
  styleUrls: ['./mes-signalements.css']
})
export class MesSignalements implements OnInit {
  tableSearch: string = '';
  
  selectedStatus: string = 'All';
  selectedPriority: string = 'All';

  showStatusDropdown: boolean = false;
  showPriorityDropdown: boolean = false;

  statusOptions: string[] = ['All', 'Open', 'In Progress', 'Resolved'];
  priorityOptions: string[] = ['All', 'BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE'];

  currentUserName: string = 'Employee';
  currentUserInitials: string = 'EM';

  incidents: IncidentUI[] = [];
  
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private incidentService: IncidentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const storedName = localStorage.getItem('userName') || localStorage.getItem('userEmail');
    if (storedName) {
      this.currentUserName = storedName.includes('@') ? storedName.split('@')[0] : storedName;
      const parts = this.currentUserName.split(' ');
      if (parts.length > 1) {
        this.currentUserInitials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts[0].length >= 2) {
        this.currentUserInitials = parts[0].substring(0, 2).toUpperCase();
      }
    }

    this.loadRealIncidents();
  }

  loadRealIncidents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.incidentService.getMyIncidents().subscribe({
      next: (data: any[]) => {
        console.log('Raw data received for my incidents:', data);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          this.incidents = [];
        } else {
          this.incidents = data.map(inc => ({
            code: `INC-${inc?.id || '0'}`,
            title: inc?.title || 'No Title',
            category: inc?.categoryName || inc?.category?.name || inc?.category || 'General',
            reportedBy: this.currentUserName,
            severity: inc?.priority || inc?.severity || 'Medium',
            status: this.mapStatus(inc?.status),
            date: this.formatDate(inc?.createdAt || inc?.date)
          }));
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

  mapStatus(backendStatus: string): string {
    if (!backendStatus) return 'Open';
    const s = backendStatus.toString().toUpperCase();
    if (s === 'RESOLU' || s === 'RESOLVED') return 'Resolved';
    if (s === 'EN_COURS' || s === 'IN_PROGRESS') return 'In Progress';
    return 'Open';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  toggleStatusDropdown() {
    this.showStatusDropdown = !this.showStatusDropdown;
    this.showPriorityDropdown = false;
  }

  togglePriorityDropdown() {
    this.showPriorityDropdown = !this.showPriorityDropdown;
    this.showStatusDropdown = false;
  }

  selectStatus(status: string) {
    this.selectedStatus = status;
    this.showStatusDropdown = false;
  }

  selectPriority(priority: string) {
    this.selectedPriority = priority;
    this.showPriorityDropdown = false;
  }

  get filteredIncidents() {
    if (!this.incidents) return [];
    return this.incidents.filter(inc => {
      const searchVal = (this.tableSearch || '').toLowerCase();
      const titleVal = (inc.title || '').toLowerCase();
      const codeVal = (inc.code || '').toLowerCase();
      
      const matchesSearch = titleVal.includes(searchVal) || codeVal.includes(searchVal);
      
      const matchesStatus = 
        this.selectedStatus === 'All' || 
        (inc.status || '').toLowerCase() === this.selectedStatus.toLowerCase();
        
      const matchesPriority = 
        this.selectedPriority === 'All' || 
        (inc.severity || '').toLowerCase() === this.selectedPriority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }
}