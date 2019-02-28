import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpModule } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  authToken: any;
  user: any;
  isDev;

  constructor(private http: Http) {
      this.isDev = false;  // Change to false before deployment
      }

  registerUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:8080/user/register', user, {headers: headers})
      .map(res => res.json());
  }

  authenticateUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:8080/user/authenticate', user, {headers: headers})
      .map(res => res.json());
  }

  forgotpasswordUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:8080/user/forgotpassword', user, {headers: headers})
      .map(res => res.json());
  }

  resetPasswordUser(user)
  {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.put('http://localhost:8080/user/updatePassword', user, {headers: headers})
      .map(res => res.json());
  }

  // searchUser(search)
  // {
  //   console.log("In search user");
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   return this.http.get('http://localhost:8080/user/showtask/' +search, {headers: headers})
  //     .map(res => res.json());
  // }


      

 getProfile() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.authToken);
    headers.append('Content-Type', 'application/json');
      let ep = this.prepEndpoint('user/profile');
       return this.http.get(ep,{headers: headers})
      .map(res => res.json());
  }
  
  prepEndpoint(ep){
    if(this.isDev){
      return ep;
    } else {
      return 'http://localhost:8080/'+ep;
    }
  }
  storeUserData(token, user) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  loggedIn() {
    return tokenNotExpired('id_token');
  }

  logout() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
  
  addtask(task) {
    console.log("add task auth service " + JSON.stringify(task));
    let headers = new Headers();
    
    headers.append('Content-Type', 'application/json');
    return this.http.post('http://localhost:8080/user/addtask', task, {headers: headers})
      .map(res => res.json());
  }

  // getTask() {
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //     let ep = this.prepEndpoint('user/showtask');
  //      return this.http.get(ep,{headers: headers})
  //     .map(res => res.json());
  // }


  getTask(user) {
    console.log("In auth service " + user);
    let headers = new Headers();
    headers.append('Authorization', user);
    headers.append('Content-Type', 'application/json');
      return this.http.get('http://localhost:8080/user/showtask',{headers: headers})
        .map(res => res.json());


  }

  updateTask(id, info){
    let headers = new Headers();
    console.log("update task auth service " +  JSON.stringify(info));
    var infoo = info[0];
    return this.http.put('http://localhost:8080/user/'+id, infoo,{headers: headers})
        .map(res => res.json());
  }
  
  deletetask(task_id)
  {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.delete('http://localhost:8080/user/' +task_id,{headers: headers})
     .map(res => res.json());
  } 

  detailtask(task_id) {
   
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.get('http://localhost:8080/user/find/' +task_id, {headers: headers})
      .map(res => res.json());
  }
  
  

}
