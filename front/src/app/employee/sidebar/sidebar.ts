import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user'; // تأكد من استيراد الـ UserService

@Component({
  selector: 'app-employee-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  userName: string = 'Loading...';
  userEmail: string = '';
  userInitials: string = '...';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService // حقن الـ UserService هنا
  ) {}

  ngOnInit(): void {
    // جلب البيانات مباشرة من الباكند لضمان أنها محدثة دائماً
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          const fName = user.firstName || user.firstname || '';
          const lName = user.lastName || user.lastname || '';
          this.userEmail = user.email || '';

          if (fName || lName) {
            this.userName = `${fName} ${lName}`.trim();
            const firstInitial = fName ? fName.charAt(0) : '';
            const lastInitial = lName ? lName.charAt(0) : '';
            this.userInitials = `${firstInitial}${lastInitial}`.toUpperCase();
          } else {
            const sub = this.userEmail.split('@')[0] || 'User';
            this.userName = sub;
            this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching profile in sidebar, fallback to token:', err);
        this.loadFromTokenFallback();
      }
    });
  }

  // Fallback طوارئ في حال حصل خطأ في الاتصال بالباكند
  loadFromTokenFallback(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fName = payload.firstName || '';
        const lName = payload.lastName || '';
        this.userEmail = payload.email || payload.sub || '';
        this.userName = `${fName} ${lName}`.trim() || 'User';
        this.userInitials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase() || 'US';
        this.cdr.detectChanges();
      } catch (e) {}
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}