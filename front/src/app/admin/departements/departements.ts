import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../services/departement';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.html',
  styleUrls: ['./departements.css']
})
export class Departements implements OnInit {
  globalSearch: string = '';
  
  // Modals States
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;

  // Add Form
  newDeptName: string = '';
  newDeptHead: string = '';

  // Edit Form
  selectedDepartment: Department | null = null;
  editDeptName: string = '';
  editDeptHead: string = '';

  departments: Department[] = [];

  constructor(
    private departmentService: DepartmentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          const colors = ['#2563eb', '#0ea5e9', '#f59e0b', '#ec4899', '#ef4444', '#6366f1'];
          
          this.departments = data.map((dept, index) => {
            const head = dept.headName || 'Unassigned';
            const initials = head !== 'Unassigned' 
              ? head.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
              : 'NA';

            return {
              ...dept,
              headName: head,
              headInitials: initials,
              headColor: colors[index % colors.length]
            };
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  // --- Add Modal ---
  openAddModal(): void {
    this.ngZone.run(() => {
      this.isEditModalOpen = false;
      this.newDeptName = '';
      this.newDeptHead = '';
      this.isAddModalOpen = true;
    });
  }

  closeAddModal(): void {
    this.ngZone.run(() => {
      this.isAddModalOpen = false;
    });
  }

  saveDepartment(): void {
    this.ngZone.run(() => {
      if (this.newDeptName.trim()) {
        const payload = {
          name: this.newDeptName.trim(),
          headName: this.newDeptHead.trim() || 'Unassigned'
        };

        this.departmentService.createDepartment(payload).subscribe({
          next: () => {
            this.loadDepartments();
            this.closeAddModal();
          },
          error: (err) => console.error('Error saving department:', err)
        });
      }
    });
  }

  // --- Edit Modal ---
  openEditModal(dept: Department): void {
    this.ngZone.run(() => {
      this.isAddModalOpen = false;
      this.selectedDepartment = dept;
      this.editDeptName = dept.name;
      this.editDeptHead = dept.headName;
      this.isEditModalOpen = true;
      this.cdr.detectChanges();
    });
  }

  closeEditModal(): void {
    this.ngZone.run(() => {
      this.isEditModalOpen = false;
      this.selectedDepartment = null;
      this.cdr.detectChanges();
    });
  }

  updateDepartment(): void {
    this.ngZone.run(() => {
      if (!this.selectedDepartment || !this.selectedDepartment.id) return;
      if (!this.editDeptName.trim()) return;

      const payload = {
        name: this.editDeptName.trim(),
        headName: this.editDeptHead.trim() || 'Unassigned'
      };

      this.departmentService.updateDepartment(this.selectedDepartment.id, payload).subscribe({
        next: () => {
          this.loadDepartments();
          this.closeEditModal();
        },
        error: (err) => console.error('Error updating department:', err)
      });
    });
  }

  deleteDepartment() {
  if (!this.selectedDepartment || !this.selectedDepartment.id) return;
  
  this.departmentService.deleteDepartment(this.selectedDepartment.id).subscribe({
    next: () => {
      console.log('Department deleted successfully');
      this.loadDepartments();
      this.closeEditModal(); // <-- استعملنا الاسم الصحيح لإغلاق النافذة
    },
    error: (err) => {
      console.error('FULL ERROR OBJECT:', err);
    }
  });
}
}