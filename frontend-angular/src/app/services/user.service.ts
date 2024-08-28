import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users'

  constructor(private http: HttpClient) { }

  getUserbyId(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  postUser(newUser: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}`, newUser)
  }
}
