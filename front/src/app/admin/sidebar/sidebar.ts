import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user'; // تأكد أن المسار صحيح

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebarcomponent implements OnInit {
  userName: string = 'Loading...';
  userEmail: string = '';
  userInitials: string = '...';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // جلب البيانات مباشرة من الباكند مثل صفحة الـ Profile
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          const fName = user.firstName || user.firstname || '';
          const lName = user.lastName || user.lastname || '';
          this.userEmail = user.email || '';

          if (fName || lName) {
            this.userName = `${fName} ${lName}`.trim();
            this.userInitials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase();
          } else {
            const sub = this.userEmail.split('@')[0] || 'User';
            this.userName = sub;
            this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading profile in sidebar:', err);
        this.userName = 'User';
        this.userInitials = 'US';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}