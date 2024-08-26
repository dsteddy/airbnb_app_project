import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Listing } from '../models/listing.model';
import { ListingsCount } from '../models/listingsCount.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {

  constructor(private http: HttpClient) { }

  getListings(page: number = 1): Observable<Listing[]> {
    return this.http.get<Listing[]>(`http://localhost:3000/api/listings?page=${page}`);
  }

  getListingsCount(): Observable<ListingsCount> {
    return this.http.get<ListingsCount>("http://localhost:3000/api/listings/count");
  }
}
