import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, Platform, ToastController, Events } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { SpotsManager } from '../../providers/spot-manager';
import { ImageManager } from '../../providers/image';
import { PhotoViewer } from '@ionic-native/photo-viewer';


declare var cordova: any;
/*
  Generated class for the NewSpotDetails page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-new-spot-details',
  templateUrl: 'new-spot-details.html',
  providers: [SpotsManager, ImageManager]
})
export class NewSpotDetailsPage {
    spot:  {length: number, name: string, type: number, description: string, images: Array<{src: string, title: string}> };
    pos: [number, number];

  constructor(private photoViewer: PhotoViewer, public imgManager: ImageManager, public events: Events, public spotsManager: SpotsManager, private storage: NativeStorage, public toastCtrl: ToastController, public actionSheetCtrl: ActionSheetController, public platform: Platform, public navCtrl: NavController, public navParams: NavParams) {
    this.spot = {length: null, type: null,name: null, description: null, images: Array<{src: string, title: string}>() };
    this.storage.getItem('spot').then(data => {
      if(data != null){
        this.spot = data;
      }
    })
  }

  showImage(img){
    this.photoViewer.show(img.src);
  }

  removeImage(img){
    let index = this.spot.images.indexOf(img);
    this.spot.images.splice(index, 1);
  }

  ionViewDidLeave(){
    this.storage.setItem('spot', this.spot);
  }

  expandText(){
    var element: HTMLElement = document.getElementById('descriptionTextarea');
    element.style.height = element.scrollHeight + "px";
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad NewSpotDetailsPage');
  }

  saveMarker(){
    this.spotsManager.registerSpot(this.spot)
  }

  uploadImage() {
    this.imgManager.getImage(this.spot.images)
  }

}
