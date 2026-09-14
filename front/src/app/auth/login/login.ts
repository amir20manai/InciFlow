import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.value;
    this.errorMessage = '';

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        console.log('RESULT OBJECT FROM BACKEND:', JSON.stringify(response));

        if (!response || !response.token) {
          console.error('ERROR: Token is missing from backend response!');
          this.errorMessage = 'Erreur de connexion: Token introuvable.';
          return;
        }

        // تخزين التوكن والرول في الـ LocalStorage
        localStorage.setItem('token', response.token);
        
        const role = response.role ? response.role.toLowerCase() : 'employee';
        localStorage.setItem('role', role);

        // التوجيه بحسب دور المستخدم
        this.redirectByRole(role);
      },
      error: (err) => {
        console.error('Login error', err);
        this.errorMessage = 'Email ou mot de passe incorrect!';
      }
    });
  }

  private redirectByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'technician':
        this.router.navigate(['/technicien/dashboard']);
        break;
      case 'employee':
      default:
        this.router.navigate(['/employee/dashboard']);
        break;
    }
  }
}