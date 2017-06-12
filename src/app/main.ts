import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);

export class URL{

  private baseUrl: string = "https://slapp.lacontra.de/appapi/";
  private baseImgUrl : string = this.baseUrl + "image/";
  private loginUrl: string = this.baseUrl + "login.php";
  private registerUrl: string = this.baseUrl + "register.php";
  private getSpotUrl: string = this.baseUrl + "getSpot.php";
  private registerSpotUrl: string = this.baseUrl + "registerSpot.php";
  private uploadImageUrl: string = this.baseUrl + "addImage.php";
  private getImagesUrl: string = this.baseUrl + "getImages.php";
  private removeSpotUrl: string = this.baseUrl + "removeSpot.php";
  private editSpotUrl: string = this.baseUrl + "editSpot.php";
  private imgFolderUrl: string = this.baseUrl + "image/";
  private removeImgUrl: string = this.baseUrl + "removeImage.php";
  private resetPw: string = this.baseUrl + "resetPw.php";
  private changePw: string = this.baseUrl + "changePw.php";
  private voteSpot: string = this.baseUrl + "vote.php";
  private votesForSpot: string = this.baseUrl + "getVotes.php";

  constructor(){}

  public getVotesForSpot(){
    return this.votesForSpot;
  }

  public getChangePw(){
    return this.changePw;
  }

  public getVoteSpot(){
    return this.voteSpot;
  }

  public getRemoveImg(){
    return this.removeImgUrl;
  }

  public getResetPw(){
    return this.resetPw;
  }

  public getImgFolder(){
    return this.imgFolderUrl;
  }

  public editSpot(){
    return this.editSpotUrl;
  }

  public removeSpot(){
    return this.removeSpotUrl;
  }

  public getLogin(){
    return this.loginUrl;
  }

  public getImgUrl(){
    return this.baseImgUrl;
  }

  public getRegister(){
    return this.registerUrl;
  }

  public getSpot(){
    return this.getSpotUrl;
  }

  public getRegisterSpot(){
    return this.registerSpotUrl;
  }

  public getUploadImage(){
    return this.uploadImageUrl;
  }

  public getImages(){
    return this.getImagesUrl;
  }

  public getBaseUrl(){
    return this.baseUrl;
  }
}

export class User{
  public ID: number;
  public role: number;
  public name: string;
  public email: string;
  public createdAt: string;

  constructor(id: number, role: number, name: string, email: string, createdAt:string ){
    this.ID = id;
    this.role = role;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }

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
