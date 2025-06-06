import { Injectable } from '@angular/core';
import { ref } from 'process';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../app.routes';

export interface User {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSource = new BehaviorSubject<User | null>(null);
  
  public currentUser$ = this.currentUserSource.asObservable();

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    // Wenn Token und User-Daten im Speicher existieren, war der Benutzer schon eingeloggt.
    if (token && userData) {
      this.currentUserSource.next(JSON.parse(userData) as User);
    }
  }


  public loginSuccess(user: User, token: string, expiresIn: number, refreshExpiresIn: number, refreshToken: string): void {

    localStorage.setItem('authToken', token);
    localStorage.setItem('expires_in', expiresIn.toString());
    localStorage.setItem('refresh_expires_in', refreshExpiresIn.toString());
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  // Diese Methode kann von einem Logout-Button aufgerufen werden.
  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('refresh_expires_in');
    localStorage.removeItem('refresh_token');

    this.currentUserSource.next(null);
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public getCurrentUser(): User | null {
    return this.currentUserSource.getValue();
  }
}