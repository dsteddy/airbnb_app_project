import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Listing } from '../models/listing.model';
import { ListingsCount } from '../models/listingsCount.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {

  private apiUrl = 'http://localhost:3000/api/listings'

  constructor(private http: HttpClient) { }

  getListings(page: number = 1): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}?page=${page}`);
  }

  getListingsCount(): Observable<ListingsCount> {
    return this.http.get<ListingsCount>(`${this.apiUrl}/count`);
  }

  getListingById(id: string):  Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  postListing(newListing: Listing): Observable<Listing> {
    return this.http.post<Listing>(`${this.apiUrl}`, newListing)
  }
}
