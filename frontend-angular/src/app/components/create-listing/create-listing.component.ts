import { Component, OnInit } from '@angular/core';
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
export class CreateListingComponent implements OnInit {
  listingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
  ) {}

  ngOnInit(): void {
    this.listingForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      neighborhood_overview: [''],
      picture_url: [''],
      host_name: ['', Validators.required],
      host_about: [''],
      host_picture_url: [''],
      neighbourhood_cleansed: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      room_type: ['', Validators.required],
      amenities: [''],
      price: [null, Validators.required],
      minimum_nights: [1, Validators.required],
      maximum_nights: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.listingForm.valid) {
      const newListing: Listing = this.listingForm.value;
      this.listingService.postListing(newListing).subscribe(response => {
        console.log('Listing created:', response);

      });
    }
  }
}
