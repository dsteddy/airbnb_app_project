import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userProfile!: User
  editingUser = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    picture_url: '',
  };
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const listingId = +this.route.snapshot.paramMap.get('id')!;
    this.userService.getProfile().subscribe((data: User) => {
      this.userProfile = data;
    });
  }

  onDeleteAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.userService.deleteAccount(this.userProfile.id).subscribe({
        next: (response) => {
          this.userService.logout();
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error deleting user:", error);
        }
      });
    }
  }

  startEditing(user: User): void {
    this.isEditing = true;
    this.editingUser = {
      name: user.name,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
      description: user.description!,
      picture_url: user.picture_url!,
    };
    console.log(this.editingUser);
  }

  saveProfile(): void {
    if (this.isEditing) {
      const updatedProfile = {
        name: this.editingUser.name,
        email: this.editingUser.email,
        password: this.editingUser.password,
        description: this.editingUser.description,
        picture_url: this.userProfile.picture_url
      };
      this.userService.updateProfile(this.userProfile.id, updatedProfile).subscribe({
        next: () => {
          this.userService.getProfile().subscribe((data: User) => {
            this.userProfile = data;})
          this.editingUser = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            description: '',
            picture_url: '',
          };
          this.isEditing = false;
        },
        error: (error) => {
          console.error("Error updating user:", error);
          this.editingUser = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            description: '',
            picture_url: '',
          };
          this.isEditing = false;
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingUser = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      description: '',
      picture_url: '',
    };
    this.isEditing = false;
  }


}
