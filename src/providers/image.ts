import { Injectable } from '@angular/core';
import { ActionSheetController, Platform, ToastController, Events } from 'ionic-angular';

import { FilePath } from '@ionic-native/file-path'
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Http, Headers } from '@angular/http';
import { URL } from '../app/main'
import 'rxjs/add/operator/map';

declare var cordova: any;

/*
  Generated class for the Image provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ImageManager {
  private url: URL = new URL();
  constructor(private camera: Camera, public http: Http, public events: Events, public actionSheetCtrl: ActionSheetController, public platform: Platform, public toastCtrl: ToastController  ) {
    //console.log('Hello Image Provider');
  }

  public getImage(appendTo, func = (a)=> {}) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    // create action sheet to choos if user wants Image from Camera or Gallery
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            //this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY, appendTo, func);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.camera.getPicture(options).then((imageData) => {
             // imageData is either a base64 encoded string or a file URI
             // If it's base64:
             let base64Image = 'data:image/jpeg;base64,' + imageData;
            }, (err) => {
             // Handle error
            });
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  /***
  * delete image from server and afterwards call the event "refresImages"
  * Images that were removed are compleatly deleted from the server
  ***/
  public removeImg(imgID: number, userID: number){

    var data = JSON.stringify({imgID: imgID, userID: userID});
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // check the current frame for spots and get them from the server
    this.http.post(this.url.getRemoveImg(), data, headers).subscribe(res => {
      this.events.publish("refresImages")
    }, err => {

    })
  }


  /***
  * presents toast for 3000ms default time
  ***/
  private presentToast(text, time = 3000) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: time,
      position: 'top'
    });
    toast.present();
  }


}
