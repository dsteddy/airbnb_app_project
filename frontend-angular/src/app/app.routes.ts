import { Routes } from '@angular/router';
import { ListingsListComponent } from './components/listings-list/listings-list.component';
import { ListingDetailsComponent } from './components/listing-details/listing-details.component';
import { CreateListingComponent } from './components/create-listing/create-listing.component';
import { CreateUserComponent } from './components/create-user/create-user.component';

export const routes: Routes = [
    { path: '', component: ListingsListComponent },
    { path: 'listing/:id', component: ListingDetailsComponent },
    { path: 'add', component: CreateListingComponent },
    { path: 'signup', component: CreateUserComponent },
];
