import { Routes } from '@angular/router';
import { ListingsListComponent } from './components/listings-list/listings-list.component';
import { ListingDetailsComponent } from './components/listing-details/listing-details.component';
import { CreateListingComponent } from './components/create-listing/create-listing.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { LoginComponent } from './components/login/login.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';

export const routes: Routes = [
    { path: '', component: ListingsListComponent },
    { path: 'listing/:id', component: ListingDetailsComponent },
    { path: 'listings/add', component: CreateListingComponent },
    { path: 'signup', component: CreateUserComponent },
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'profile/edit', component: UserEditComponent },
];
