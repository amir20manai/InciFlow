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
  department: string = '';
  phone: string = '';

  // حقول تغيير كلمة السر
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
        console.log("Full User Object from Backend:", user);
        if (user) {
          this.firstName = user.firstName || user.firstname || '';
          this.lastName = user.lastName || user.lastname || '';
          this.email = user.email || '';
          this.role = user.role || 'EMPLOYEE';
          this.department = user.department || '';
          this.phone = user.phone || '';
          
          // حساب الاسم الكامل والحروف الأولى لعرضها في البروفيل
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
    department: { name: this.department },
    phone: this.phone
  };

  this.userService.updateProfile(data).subscribe({
    next: (res) => {
      alert('Profile updated successfully!');
      window.location.reload(); // إعادة تحميل الصفحة ستجعل الـ Sidebar والـ Profile يجلبان الاسم الجديد من الباكند فوراً
    },
    error: (err) => {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
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