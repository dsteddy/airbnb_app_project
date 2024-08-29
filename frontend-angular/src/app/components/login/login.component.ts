import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private userService: UserService, private router: Router) { }

  login(): void {
    this.userService.loginUser(this.email, this.password).subscribe({
      next: (response) => {
        this.userService.setToken(response.token);
        this.router.navigate(['']);
      },
      error: (err) => console.error('Login error:', err)
    });
  }
}
