import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  userForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', []]
    });
  }

  get password() {
    return this.userForm?.get('password');
  }

  get confirmPassword() {
    return this.userForm?.get('confirmPassword');
  }
  get passwordDoesMatch() {
      return this.password?.value === this.confirmPassword?.value;
    }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      this.userService.postUser(this.userForm.value as User).subscribe({
        next: (response) => {
          this.successMessage = "User created successfully!";
          this.errorMessage = null;
          this.router.navigate(['']);
        },
        error: (error) => {
          if (error.error && error.error.error === 'Email already exists') {
            this.errorMessage = "The email address is already registered.";
            this.isSubmitting = false;
          } else {
            this.errorMessage = "Error adding user. Please try again.";
            this.isSubmitting = false;
          }
          this.successMessage = null;
          console.error("Error adding user:", error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}
