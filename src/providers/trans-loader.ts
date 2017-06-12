import { Injectable } from '@angular/core';
import { LoadingController, ToastController, AlertController } from 'ionic-angular';

import {TranslateService} from 'ng2-translate';

/*
  Generated class for the Image provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class TranslatLoader {
  loader: any = null;
  toast: any = null;
  constructor(public toastCtrl: ToastController, public translate: TranslateService, public loadCtrl: LoadingController, public alertCtrl: AlertController){
  }

  present(loaderText: string){
    this.translate.get(loaderText).subscribe((res: string) => {loaderText = res});
    this.loader = this.loadCtrl.create({content:loaderText});
    this.loader.present();
  }

  /***
  * present Toast for default 3000ms at the bottom of the screen
  ***/
  public presentToast(text: string, time = 3000) {
    this.translate.get(text).subscribe((res: string) => {text = res});
    let toast = this.toastCtrl.create({
      message: text,
      duration: time,
      position: 'bottom'
    });
    toast.present();
  }

  /***
  * dismiss the loader and if text != null present the text in a toast message for 3000ms at the bottom of the screen
  ***/
  dismiss(text?: string){
    this.loader.dismiss();
    this.loader = null;
    if(text != null && text != ""){
      this.presentToast(text);
    }
  }

  alert(title: string, text: string){
    if(this.loader != null){
      this.loader.dismiss();
      this.loader = null;
    }
    this.translate.get(title).subscribe((res: string) => {title = res})
    this.translate.get(text).subscribe((res: string) => {text = res})
    let alert = this.alertCtrl.create({title: title, subTitle:  text, buttons: ['OK']});
    alert.present();
  }
}
