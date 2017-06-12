import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserConnect } from '../../providers/user-connect'
import { NativeStorage } from '@ionic-native/native-storage';

import { AlertController, LoadingController } from 'ionic-angular';

import { RegisterPage } from '../register/register';
import 'rxjs/add/operator/map';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers:[UserConnect]
})
export class LoginPage {
  register = RegisterPage;
  userdata = {};
  email: string = "";
  password: string = "";
  loader;

  constructor(
      public navCtrl: NavController,
      public alertCtrl: AlertController,
      public loading: LoadingController,
      public userConnect: UserConnect,
      private storage: NativeStorage,
    ) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LoginPage');
  }

  pwReset(){
    let prompt = this.alertCtrl.create({
      title: 'Reset Password',
      message: "Please enter you email",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Reset',
          handler: data => {
            this.userConnect.resetPassword(data.email);
          }
        }
      ]
    });
    prompt.present();
  }

  login(){
    if( this.email != "" && this.password != "" ){
      this.userConnect.login(this.email, this.password, this.storage)
    }
    else{
      let alert = this.alertCtrl.create({title: "Error", subTitle: "Enter your email and password" , buttons: ['OK']});
      alert.present();
    }
  }

}
