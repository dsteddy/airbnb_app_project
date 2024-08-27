import { Component, Input } from '@angular/core';
import { Listing } from '../../models/listing.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.css'
})
export class ListingCardComponent {
  @Input()
  listing!: Listing;

  constructor(private router: Router) {}

  viewListingDetails(id: string): void {
    this.router.navigate(['/listing', id]);
  }
}
