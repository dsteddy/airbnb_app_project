import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent implements OnInit {
  userProfile!: User
  userForm: FormGroup;
  isSubmitting = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router) {
      this.userForm = this.fb.group({
        name: ['', [Validators.minLength(3)]],
        email: ['', [Validators.email]],
        password: ['', [Validators.minLength(4)]],
        confirmPassword: ['', []],
        description: ['', []]
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

  ngOnInit(): void {
    this.userService.getProfile().subscribe((data: User) => {
      this.userProfile = data;
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      // post user
    }
  }

}
