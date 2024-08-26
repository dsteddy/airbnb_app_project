import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Listing } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { ListingCardComponent } from '../listing-card/listing-card.component';
import { ListingsCount } from '../../models/listingsCount.model';

@Component({
  selector: 'app-listings-list',
  standalone: true,
  imports: [CommonModule, ListingCardComponent],
  templateUrl: './listings-list.component.html',
  styleUrl: './listings-list.component.css'
})
export class ListingsListComponent implements OnInit {
  // Lists of listings to display
  listings!: Listing[];
  // Total number of listings
  listingsCount: ListingsCount = { total_rows: 0 };
  // Total number of pages to display all listings (32 per page)
  totalPages: number = 0;
  currentPage: number = 1;
  // Page number to display for pagination
  pageNumbers: (number | string)[] = [];

  constructor(private listingsService: ListingService) {}

  getListings(page: number = 1): void {
    this.listingsService.getListings(page).subscribe((data: Listing[]) => {
      this.listings = data;
      this.currentPage = page;
      this.updatePageNumbers();
    });
  }

  getListingsCount(): void {
    this.listingsService.getListingsCount().subscribe((data: ListingsCount) => {
      this.listingsCount = data
      this.totalPages = Math.ceil(this.listingsCount.total_rows / 32)
      this.updatePageNumbers();
    });
  }

  updatePageNumbers(): void {
    this.pageNumbers = [];
    // If total pages are less than or equal to 5, show all pages
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pageNumbers.push(i);
      }
    } else {
      // Always show first page
      this.pageNumbers.push(1);
      if (this.currentPage <= 3) {
        // If current page is close to the start
        for (let i = 2; i <= 4; i++) {
          this.pageNumbers.push(i)
        }
      this.pageNumbers.push('...');
      } else if (this.currentPage >= this.totalPages - 2) {
        // If current page is close to the end
        this.pageNumbers.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          this.pageNumbers.push(i);
        }
      } else {
        this.pageNumbers.push('...');
        this.pageNumbers.push(this.currentPage - 1);
        this.pageNumbers.push(this.currentPage);
        this.pageNumbers.push(this.currentPage + 1);
        this.pageNumbers.push('...');
      }
    }
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.getListings(page);
    }
  }

  ngOnInit(): void {
    this.getListings();
    this.getListingsCount();
  }

  @Output()
  sendListing: EventEmitter<Listing> = new EventEmitter<Listing>();

  showDetails(clickedListing: Listing): void {
    this.sendListing.emit(clickedListing);
  }
}
