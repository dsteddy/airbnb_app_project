import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

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

  loginUser(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  getProfile(): Observable<User>{
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
    const decodedToken: any = jwtDecode(token as string);
    const id = decodedToken.id;
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers });
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  deleteAccount(id: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${id}`)
  }

  updateProfile(id: number, modifiedUser: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, modifiedUser)
  }

  userBecomeHost(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/host/${id}`)
  }
}
