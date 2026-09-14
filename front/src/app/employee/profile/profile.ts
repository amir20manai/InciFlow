import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';
  email: string = '';
  role: string = 'EMPLOYEE';
  initials: string = '';
  title: string = 'System User';
  department: any = ''; // يمكن أن يكون نصاً أو كائناً حسب الباكند
  phone: string = '';

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          this.firstName = user.firstName || user.firstname || '';
          this.lastName = user.lastName || user.lastname || '';
          this.email = user.email || '';
          this.role = user.role || 'EMPLOYEE';
          // إذا كان القسم يأتي على شكل كائن فيه name أو id
          this.department = user.department?.name || user.department || '';
          this.phone = user.phone || '';
          
          this.fullName = `${this.firstName} ${this.lastName}`.trim();
          this.initials = `${this.firstName ? this.firstName.charAt(0) : ''}${this.lastName ? this.lastName.charAt(0) : ''}`.toUpperCase();
          this.title = this.role === 'ADMIN' ? 'System Administrator' : 'Employee';

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching profile details:', err);
      }
    });
  }

  updateProfile(): void {
    const data = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      department: typeof this.department === 'string' ? { name: this.department } : this.department,
      phone: this.phone
    };

    this.userService.updateProfile(data).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        this.loadUserProfile();
        // إعادة تحميل خفيفة أو تحديث لتنعكس البيانات في الـ Sidebar أيضاً
        window.location.reload();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Error updating profile: ' + (err.error?.message || 'Check console for details'));
      }
    });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    const data = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(data).subscribe({
      next: (res) => {
        alert('Password changed successfully!');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to change password. Check your current password.');
      }
    });
  }
}