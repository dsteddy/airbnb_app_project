import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingService } from '../../services/listing.service';
import { Listing } from '../../models/listing.model';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.css'
})
export class CreateListingComponent {
  listingForm: FormGroup;

  constructor(private fb: FormBuilder, private listingService: ListingService) {
    this.listingForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      neighborhood_overview: [''],
      picture_url: ['', Validators.required],
      host_name: ['', Validators.required],
      host_about: [''],
      host_picture_url: [''],
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

  onSubmit() {
    if (this.listingForm.valid) {
      this.listingService.postListing(this.listingForm.value as Listing).subscribe({
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

