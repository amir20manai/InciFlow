import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrls: ['./utilisateurs.css']
})
export class Utilisateurs implements OnInit {
  globalSearch: string = '';
  users: any[] = [];
  errorMessage = '';

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // جلب المستخدمين من الباكند وتجهيز الـ UI attributes بحماية كاملة من الـ null/undefined
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('DATA RECEIVED FROM BACKEND:', res);
        
        // استخراج اللستة سواء كانت Array مباشرة أو داخل Object
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const colors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
        
        this.users = list.map((u: any, index: number) => {
          const firstName = u?.firstName || u?.prenom || '';
          const lastName = u?.lastName || u?.nom || '';
          const fullName = `${firstName} ${lastName}`.trim() || u?.email || 'User';
          
          const firstInitial = firstName.charAt(0) || '';
          const lastInitial = lastName.charAt(0) || '';
          const initials = (firstInitial + lastInitial).toUpperCase() || 'U';

          let deptName = 'General';
          if (u?.department) {
            deptName = typeof u.department === 'object' ? u.department.name : u.department;
          }

          return {
            ...u,
            name: fullName,
            subtitle: `${deptName} Member`,
            initials: initials,
            color: colors[index % colors.length],
            role: u?.role || 'Employee',
            department: deptName,
            phone: u?.phone || u?.telephone || 'No phone',
            email: u?.email || 'No email'
          };
        });

        console.log('FINAL USERS ARRAY:', this.users);

        // إجبار Angular على تحديث الواجهة وعرض الداتا فوراً
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.cdr.detectChanges();
      }
    });
  }

  // حذف مستخدم
  deleteUser(id: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== id);
          this.cdr.detectChanges(); // تحديث الواجهة بعد الحذف
        },
        error: (err) => {
          console.error('Error deleting user', err);
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }

  getRoleClass(role: string): string {
    if (!role) return 'employee';
    switch (role.toLowerCase()) {
      case 'administrator': case 'admin': return 'admin';
      case 'technician': return 'technician';
      case 'employee': return 'employee';
      default: return 'employee';
    }
  }
}