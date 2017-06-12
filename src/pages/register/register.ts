import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { UserConnect } from '../../providers/user-connect'
import { NativeStorage } from '@ionic-native/native-storage';

import {TranslateService} from 'ng2-translate';

/*
  Generated class for the Register page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers:[UserConnect]
})
export class RegisterPage {
  username: string;
  email: string;
  password: string;
  rePassword: string;
  checked: boolean;

  constructor(public userCnt: UserConnect, public translate: TranslateService, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private storage: NativeStorage) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad RegisterPage');
  }

  register(){
    if(this.username && this.email && this.password && this.password == this.rePassword && this.email.includes("@")){
      this.userCnt.register(this.username, this.email, this.password);
    }
    else if(this.password != this.rePassword){
      let err = "Error"
      this.translate.get(err).subscribe((res: string) => {err = res})
      let enterName = "Your Passwords are not the same please re enter";
      this.password = null;
      this.rePassword = null;
      this.translate.get(enterName).subscribe((res: string) => {enterName = res})
      let alert = this.alertCtrl.create({title: err, subTitle: enterName , buttons: ['OK']});
      alert.present();
    }
    else{
      if(this.checked){
        let err = "Error"
        this.translate.get(err).subscribe((res: string) => {err = res})
        let enterName = "Enter username, password and email."
        this.translate.get(enterName).subscribe((res: string) => {enterName = res})
        let alert = this.alertCtrl.create({title: err, subTitle: "Enter username, password and email." , buttons: ['OK']});
        alert.present();
      }
      else{
        let err = "Error"
        this.translate.get(err).subscribe((res: string) => {err = res})
        let acceptTerms = "Accept the terms and conditions"
        this.translate.get(acceptTerms).subscribe((res: string) => {acceptTerms = res})
        let alert = this.alertCtrl.create({title: err, subTitle:  acceptTerms, buttons: ['OK']});
        alert.present();
      }
    }
  }

}
