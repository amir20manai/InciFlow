import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValues = this.registerForm.value;

    if (formValues.password !== formValues.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas!';
      return;
    }

    this.errorMessage = '';

    const userData = {
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      email: formValues.email,
      password: formValues.password,
      phone: formValues.phone,
      role: 'EMPLOYEE', // أو الرول الافتراضي اللي تحب عليه
      department: 'IT Department'  // أو تحب تزيد input في الفورم متاعو
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Compte créé avec succès!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error('Registration error', err);
        this.errorMessage = 'Erreur lors de l\'inscription. Cet email est peut-être déjà utilisé.';
      }
    });
  }
}