import { Component, OnInit } from '@angular/core';
import { Listing } from '../../models/listing.model';
import { ActivatedRoute } from '@angular/router';
import { ListingService } from '../../services/listing.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-details.component.html',
  styleUrl: './listing-details.component.css'
})
export class ListingDetailsComponent implements OnInit {
  listing!: Listing;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService
  ) {}

  ngOnInit(): void {
    const listingId = this.route.snapshot.paramMap.get('id')!;
    this.listingService.getListingById(listingId).subscribe((data: Listing) => {
      this.listing = data;
    });
  }

}
