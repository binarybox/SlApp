import { Injectable } from '@angular/core';


import 'rxjs/add/operator/map';

/*
  Generated class for the User provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class User {
  constructor(id: number, role: number, name: string, email: string, createdAt: string) {
    this.ID = id;
    this.role = role;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }

  private ID: number;
  private role: number;
  private name: string;
  private email: string;
  private createdAt: string;
/*
  constructor(id: number, role: number, name: string, email: string, createdAt:string ){
    this.ID = id;
    this.role = role;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }
  */

  public getID(){
    return this.ID;
  }

  public getName(){
    return this.name;
  }

  public getEmail(){
    return this.email;
  }

}
