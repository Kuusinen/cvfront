import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string = "http://localhost:8080/cv/login";

  private userLog!: string;

  private roles!: string;

  private helper = new JwtHelperService();

  private token!: string;

  constructor(private http: HttpClient) { }

  login(user: User) {
    return this.http.post<User>(this.apiUrl, user, { observe: 'response' });
  }

  saveToken(jwt: string) {
    localStorage.setItem("jwt", jwt);
    this.token = jwt;
    this.decodeJWT(jwt);
  }

  decodeJWT(token: string) {
    const decodedToken = this.helper.decodeToken(token);
    this.roles = decodedToken.roles;
    this.userLog = decodedToken.sub;
  }

  getToken(): string {
    this.token = localStorage.getItem("jwt") || "";

    if(this.helper.isTokenExpired(this.token)){
      this.token = "";
      localStorage.removeItem("jwt");
    }

    return this.token;
  }

  logout() {
    this.userLog = "";
    this.roles = "";
    localStorage.removeItem("jwt");
  }

  isTokenExpired(): boolean {
    return this.helper.isTokenExpired(this.token);
  }
}
