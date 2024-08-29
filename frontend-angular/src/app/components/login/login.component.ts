import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private userService: UserService, private router: Router) { }

  login(): void {
    this.userService.loginUser(this.email, this.password).subscribe({
      next: (response) => {
        this.userService.setToken(response.token);
        this.router.navigate(['']);
      },
      error: (err) => {
        this.errorMessage = "L'adresse mail ou le mot de passe est erroné."
        console.error('Login error:', err)
      }
    });
  }
}
