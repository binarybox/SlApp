import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

import {TranslateService} from 'ng2-translate';
import { UserConnect } from '../../providers/user-connect'

import { NativeStorage } from '@ionic-native/native-storage';

/*
  Generated class for the ChangePassword page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html',
  providers:[UserConnect]
})
export class ChangePasswordPage {
  private password : FormGroup;
  private id: number;
  private noMatchPassword: boolean = true;
  constructor(public userConnect: UserConnect,public translater: TranslateService,public alertCtrl: AlertController, private storage: NativeStorage, private formBuilder: FormBuilder, public navCtrl: NavController, public navParams: NavParams) {
    this.password = this.formBuilder.group({
      new: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[a-zA-Z0-9]*$'),
      ]) ],
      old: ['', Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.pattern('^[a-zA-Z0-9]*$'),
      ]) ]
    });
    this.storage.getItem("user").then(user => {this.id = user.ID; console.log(user)});
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangePasswordPage');
  }

  changePw(){
    let text = "Please repeate your new Passwort."
    let title = "and again";
    let alert = this.alertCtrl.create({
      title: title,
      message: text,
      inputs: [
        {
        name: 'password',
        placeholder: 'Password',
        type: 'password'
      }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (data) => {
            if(this.password.value.new == data.password){
              this.userConnect.changePassword(this.id, this.password.value.new, this.password.value.old);

            }
            else{
              this.noMatchPassword = false;
            }
          }
        }
      ]
    })
    alert.present();
  }

}
