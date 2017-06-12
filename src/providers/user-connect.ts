import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { NavController, Events } from 'ionic-angular';
import { URL } from '../app/main';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { User } from './user';
import {TranslateService} from 'ng2-translate';

import { TranslatLoader } from './trans-loader';

import { MapPage } from '../pages/map/map';
import 'rxjs/add/operator/map';

/*
  Generated class for the UserConnect provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class UserConnect {

  private transLoader: TranslatLoader;
  constructor(
    public translate: TranslateService,
    public events: Events,
    public http: Http,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadCtrl: LoadingController,
    public toastCtrl: ToastController,
    private storage: NativeStorage) {

    this.transLoader = new TranslatLoader(toastCtrl, translate, loadCtrl, alertCtrl)

  }

  login(email: string, password: string, storage: NativeStorage){
    this.transLoader.present("Checking ! Please wait...");

      var url = new URL().getLogin();
      var data = JSON.stringify({email: email, password: password});

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(url, data, headers).subscribe((res) =>
        {

          var response = JSON.parse(res['_body']);
          if(response['error']){
            let alert = this.alertCtrl.create({title: "Error", subTitle: response['error'] , buttons: ['OK']});
            //loader.dismissAll();
            alert.present();
            this.transLoader.dismiss();
          }
          else{
            //loader.dismissAll();

            let user = new User(parseInt(response['id']), parseInt(response['role']), response['name'], response['email'], response['created_at']);
            storage.setItem('user', user).then(() => {
              this.events.publish("userloggedin", user);
              this.navCtrl.popToRoot();

              this.transLoader.dismiss("Hello " + user['name']);
            })
          }
        }, error => {
          console.log(error)
          error(error);
          this.transLoader.dismiss();
        }
      )
  }

  register(name: string, email: string, password: string){
    var url = new URL().getRegister();
    var data = JSON.stringify({name: name, email: email, password: password});

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.transLoader.present("Checking ! Please wait...")

    this.http.post(url, data, headers).subscribe(res =>
      {
        var response = JSON.parse(res['_body']);
        if(response['error']){
          let alert = this.alertCtrl.create({title: "Error", subTitle: response['error'] , buttons: ['OK']});
          password = null;
          //loader.dismissAll();
          this.transLoader.dismiss();
          alert.present();
        }
        else{
          //loader.dismissAll();
          this.storage.setItem('user', new User(parseInt(response['id']), parseInt(response['role']), response['name'], response['email'], response['created_at'] )).then(() => {
          this.transLoader.dismiss("Hello " + response['name']);
          this.navCtrl.setRoot(MapPage);
          });
        }
      }, error => {
        //loader.dismissAll();
        //console.log(error)
        this.transLoader.dismiss();
        let wrong = "Oh, something strange happend, please try again"
        let err = "Error"
        this.translate.get(err).subscribe((res: string) => {err = res})
        this.translate.get(wrong).subscribe((res: string) => {wrong = res})
        let alert = this.alertCtrl.create({title: err, subTitle:  wrong, buttons: ['OK']});
        alert.present();
      }
    )
  }

  changePassword(id: number, newPassword: string, oldPassword: string){
    let url = new URL().getChangePw();
    var data = JSON.stringify({ID: id, newPW: newPassword, oldPW: oldPassword});
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.transLoader.present("changing Password")

    this.http.post(url, data, headers).subscribe(res =>
      {
        console.log(res)
        var response = JSON.parse(res['_body']);
        if(!response['error']){
          this.transLoader.dismiss("Your Password is changed");
          this.navCtrl.pop();
        }
        else{
          let text = response['error'];
          let title = "Error"
          this.transLoader.alert(title, text);
        }
      }, error => {
        let text = "Oh, something strange happend, please try again"
        let title = "Error"
        this.transLoader.alert(title, text);
      }
    )
  }

  resetPassword(email: string){
    let url = new URL().getResetPw();
    var data = JSON.stringify({email: email});
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    let loader = this.loadCtrl.create({content: "Sending Email"});
    loader.present();

    this.http.post(url, data, headers).subscribe(res =>
      {
        var response = JSON.parse(res['_body']);
        if(!response['error']){
          let text = "We sent a email with your new password to your email adress."
          let title = "Success"
          this.transLoader.alert(title, text);
        }
        else{
          let text = "We don't know your Email. Did you register yet?"
          let title = "Error"
          this.transLoader.alert(title, text);
        }
      }, error => {
        let text = "Oh, something strange happend, please try again"
        let title = "Error"
        this.transLoader.alert(title, text);
      }
    )
  }
}
