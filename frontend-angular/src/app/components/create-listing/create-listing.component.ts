import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.css'
})
export class CreateListingComponent implements OnInit {
  listingForm: FormGroup;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private userService: UserService,
    private router: Router) {
    this.listingForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      neighborhood_overview: [''],
      picture_url: ['', Validators.required],
      neighbourhood_cleansed: [''],
      latitude: ['', [Validators.required, Validators.pattern('^-?\\d{1,3}\\.\\d{1,7}$')]],
      longitude: ['', [Validators.required, Validators.pattern('^-?\\d{1,3}\\.\\d{1,7}$')]],
      room_type: ['', Validators.required],
      amenities: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      minimum_nights: ['', [Validators.required, Validators.min(1)]],
      maximum_nights: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe((data: User) => {
      this.userId = data.id;
    });
  }

  onSubmit() {
    if (this.listingForm.valid) {
      const listingToAdd = {
        ...this.listingForm.value,
        host_id: this.userId,
      }
      console.log(listingToAdd)
      this.listingService.postListing(listingToAdd).subscribe({
        next: (response) => {
          // this.listingForm.reset();
          console.log("Success", this.listingForm)
        },
        error: (error) => {
          console.error("Error adding listing:", error);
        }
      });
    }
  }
}

