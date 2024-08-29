import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Listing } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ListingCardComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userProfile!: User
  userListings: Listing[] | null = null;

  constructor(
    private userService: UserService,
    private listingService: ListingService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userService.getProfile().subscribe((data: User) => {
      this.userProfile = data;
      if (this.userProfile.is_host) {
        this.listingService.getUsersListings(this.userProfile.id).subscribe((data: Listing[]) => {
          this.userListings = data;
        })
      }
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

  becomeHost(): void {
    this.userService.userBecomeHost(this.userProfile.id).subscribe({
      next: (response) => {
        console.log("User became host")
        this.userService.getProfile().subscribe((data: User) => {
          this.userProfile = data;
        })
      },
      error: (error) => {
        console.error("Error becoming host", error);
      }
    });
  }

  // saveProfile(): void {
  //   if (this.isEditing && this.passwordDoesMatch) {
  //       const updatedProfile = {
  //         name: this.editingUser.name,
  //         email: this.editingUser.email,
  //         password: this.editingUser.password,
  //         description: this.editingUser.description,
  //         picture_url: this.userProfile.picture_url
  //       };
  //       this.userService.updateProfile(this.userProfile.id, updatedProfile).subscribe({
  //         next: () => {
  //           this.userService.getProfile().subscribe((data: User) => {
  //             this.userProfile = data;})
  //           this.editingUser = {
  //             name: '',
  //             email: '',
  //             password: '',
  //             confirmPassword: '',
  //             description: '',
  //             picture_url: '',
  //           };
  //           this.isEditing = false;
  //         },
  //         error: (error) => {
  //           console.error("Error updating user:", error);
  //           this.editingUser = {
  //             name: '',
  //             email: '',
  //             password: '',
  //             confirmPassword: '',
  //             description: '',
  //             picture_url: '',
  //           };
  //           this.isEditing = false;
  //         }
  //     });
  //   } else {
  //     this.errorMessage = "Les deux mots de passe doivent être identique"
  //   };
  // }

}
