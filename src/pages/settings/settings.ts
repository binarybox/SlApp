import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';

import { LoginPage } from '../login/login';
import {TranslateService} from 'ng2-translate';
import { ChangePasswordPage } from '../change-password/change-password';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  private user;
  constructor(private storage: NativeStorage, public translate: TranslateService, public navCtrl: NavController,public alertCtrl: AlertController, public navParams: NavParams, public events: Events) {
    this.storage.getItem('user').then(data => {
      this.user = data;
    })
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SettingsPage');
  }

  logout(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.events.publish('userlogout');
            this.storage.remove('user').then(data => {
              this.navCtrl.pop();
            })
          }
        }
      ]
    })
    alert.present();

  }

  changePw(){
    this.navCtrl.push(ChangePasswordPage);
  }

  login(){

    this.navCtrl.push(LoginPage);
  }

  back(){
    this.navCtrl.pop();
  }

}
