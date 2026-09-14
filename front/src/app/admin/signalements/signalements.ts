import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IncidentService } from '../../services/incident'; // 👈 استدعاء الـ Service الصحيح (تأكد من المسار حسب مشروعك)

export interface Incident {
  id: number; // 👈 في الـ Backend الـ ID نوعه Long (number)
  title: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  employeeEmail?: string;
  priority: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE'; // 👈 الـ Enums الجديدة بالفرنسية
  status: 'NOUVEAU' | 'EN_COURS' | 'RESOLU';
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
export class Signalements implements OnInit {

  globalSearch: string = '';
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;

  incidents: Incident[] = []; // 👈 باش تتملى بالداتا الجاية من الـ Backend
  filteredIncidents: Incident[] = [];

  constructor(private incidentService: IncidentService) {} // 👈 الحقن للـ Service

  ngOnInit(): void {
    // الاشتراك الفوري يمنحك الداتا المخزنة حالاً ويستمع لأي تحديثات جديدة
    this.incidentService.incidents$.subscribe(data => {
      if (data && data.length > 0) {
        this.incidents = data;
        this.filterIncidents();
      }
    });

    // جلب البيانات من السيرفر لتحديثها في الخلفية
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.incidentService.getAllIncidents().subscribe({
      next: (data) => {
        // الـ getAllIncidents في الـ Service تحدت وحدها الـ BehaviorSubject عبر الـ tap
        // لذا سيتم تحديث الـ incidents تلقائياً عبر الـ subscription الفوقانية
      },
      error: (err) => {
        console.error('Erreur lors du chargement des incidents:', err);
      }
    });
  }

  filterIncidents(): void {
    this.currentPage = 1; 
    this.filteredIncidents = this.incidents.filter(inc => {
      const query = this.searchQuery.toLowerCase().trim();
      const global = this.globalSearch.toLowerCase().trim();

      const matchQuery = !query || 
        inc.title.toLowerCase().includes(query) ||
        inc.id.toString().toLowerCase().includes(query) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(query));

      const matchGlobal = !global || 
        inc.title.toLowerCase().includes(global) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(global));

      const matchStatus = this.selectedStatus === 'ALL' || inc.status === this.selectedStatus;
      const matchPriority = this.selectedPriority === 'ALL' || inc.priority === this.selectedPriority;

      return matchQuery && matchGlobal && matchStatus && matchPriority;
    });
  }

  get paginatedIncidents(): Incident[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredIncidents.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredIncidents.length / this.pageSize) || 1;
  }

  // Helper للـ Status متناسق مع الـ Enums الجديدة (NOUVEAU, EN_COURS, RESOLU)
  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    return priority ? priority.toLowerCase() : '';
  }
}