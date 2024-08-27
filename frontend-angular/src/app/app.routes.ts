import { Routes } from '@angular/router';
import { ListingsListComponent } from './components/listings-list/listings-list.component';
import { ListingDetailsComponent } from './components/listing-details/listing-details.component';

export const routes: Routes = [
    { path: '', component: ListingsListComponent },
    { path: 'listing/:id', component: ListingDetailsComponent }
];
