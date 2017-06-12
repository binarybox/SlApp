import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController, Events, ToastController } from 'ionic-angular';
import { User } from '../../app/main';
import { SpotsManager } from '../../providers/spot-manager';
import { ImageManager } from '../../providers/image';

import {TranslateService} from 'ng2-translate';

/*
  Generated class for the EditSpotPopover page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-edit-spot-popover',
  templateUrl: 'edit-spot-popover.html',
  providers: [SpotsManager, ImageManager],
})
export class EditSpotPopoverPage {
  spot: any;
  user: User;
  permission: boolean = false;
  imgPermission: boolean = false;
  constructor(public toastCtrl: ToastController, public imgManager: ImageManager, public event: Events, public viewCtrl: ViewController, public spotsManager: SpotsManager, public alertCtrl: AlertController, public translate: TranslateService, public navCtrl: NavController, public navParams: NavParams) {
    this.user = navParams.get('user');
    this.spot = navParams.get('spot');
    this.permission = ((this.spot.creator == this.user.ID) || (this.user.role < 2));
    this.imgPermission = this.user.role < 6 && this.countImgOfUser() < 15;
  }

  /***
  * returns the amount of images uploaded from this user for the current spot
  ***/
  private countImgOfUser(){
    let counter = 0;
    for(let p of this.spot.images){
      if(p != null){
        if(p.creator == this.user.ID){
          counter += 1;
        }
      }
    }
    return counter;
  }

  close(){
    this.viewCtrl.dismiss();
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad EditSpotPopoverPage');
  }

  addImage(){
    let tmp = [];
    this.imgManager.getImage(tmp, (img) => {
      this.close();
      this.spotsManager.uploadImg(img.src, img.title, this.user.ID, this.spot.ID,() => { this.event.publish('refresImages'); });
    });
    //this.spotsManager.loadImages()
  }

  delete(){
    let deleteTxt = "delete Spot";
    let areYouSure = "Are you sure you want to delete this spot?";
    let submit = "Submit";
    let cancel = "Cancel";
    this.translate.get(deleteTxt).subscribe((res: string) => {deleteTxt = res});
    this.translate.get(areYouSure).subscribe((res: string) => {areYouSure = res});
    this.translate.get(submit).subscribe((res: string) => {submit = res});
    this.translate.get(cancel).subscribe((res: string) => {cancel = res});

    let alert = this.alertCtrl.create({
      title: deleteTxt,
      subTitle: areYouSure,
      buttons: [
        {
        text: cancel,
        role: 'cancel'
      },
      {
        text: submit,
        handler: () => {
          this.spotsManager.removeSpot(this.spot.ID, this.user.ID);
          this.close();
        }
      }
      ]
    })
    alert.present()
  }

  editName(){
    let eDesc = "edit name";
    this.translate.get(eDesc).subscribe((res: string) => {eDesc = res});
    let cancel = "Cancel";
    this.translate.get(cancel).subscribe((res: string) => {cancel = res});
    let submit = "Submit";
    this.translate.get(submit).subscribe((res: string) => {submit = res});
    let alert = this.alertCtrl.create({
      title: eDesc,
      inputs: [
        {
          name: 'name',
          placeholder: 'name',
          value: this.spot.name
        }
      ],
      buttons: [
        {
          text: cancel,
          role: "cancel"
        },
        {
          text: submit,
          handler: data =>{
            this.spot.name = data.name;
            this.spotsManager.editSpot(this.spot.ID, this.user.ID, data.name, "name");
            this.close();
          }
        }
      ]
    })
    alert.present();
  }

  editDescription(){
    let eDesc = "edit description";
    this.translate.get(eDesc).subscribe((res: string) => {eDesc = res});
    let cancel = "Cancel";
    this.translate.get(cancel).subscribe((res: string) => {cancel = res});
    let submit = "Submit";
    this.translate.get(submit).subscribe((res: string) => {submit = res});
    let alert = this.alertCtrl.create({
      title: eDesc,
      inputs: [
        {
          name: 'description',
          placeholder: 'description',
          value: this.spot.description
        }
      ],
      buttons: [
        {
          text: cancel,
          role: "cancel"
        },
        {
          text: submit,
          handler: data =>{
            this.spot.description = data.description;
            this.spotsManager.editSpot(this.spot.ID, this.user.ID, data.description, "description");
            this.close();
          }
        }
      ]
    })
    alert.present();
  }

  editLength(){
    let eDesc = "edit length";
    this.translate.get(eDesc).subscribe((res: string) => {eDesc = res});
    let cancel = "Cancel";
    this.translate.get(cancel).subscribe((res: string) => {cancel = res});
    let submit = "Submit";
    this.translate.get(submit).subscribe((res: string) => {submit = res});
    let alert = this.alertCtrl.create({
      title: eDesc,
      inputs: [
        {
          name: 'length',
          placeholder: 'Length',
          type: "number",
          value: this.spot.length
        }
      ],
      buttons: [
        {
          text: cancel,
          role: "cancel"
        },
        {
          text: submit,
          handler: data =>{
            if(data.length > 0){
              this.spot.length = data.length;
              this.spotsManager.editSpot(this.spot.ID, this.user.ID, data.length, "length");
              this.close();
            }
            else { this.presentToast("invalid Length") }
          }
        }
      ]
    })
    alert.present();
  }

  private presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  editType(){

    let eDesc = "edit type";
    this.translate.get(eDesc).subscribe((res: string) => {eDesc = res});
    let cancel = "Cancel";
    this.translate.get(cancel).subscribe((res: string) => {cancel = res});
    let submit = "Submit";
    this.translate.get(submit).subscribe((res: string) => {submit = res});
    let regular = "regular";
    this.translate.get(regular).subscribe((res: string) => {regular = res});
    let waterline = "waterline";
    this.translate.get(waterline).subscribe((res: string) => {waterline = res});
    let highline = "highline";
    this.translate.get(highline).subscribe((res: string) => {highline = res});
    let typeArray = [regular, waterline, highline];
    let alert = this.alertCtrl.create({
      title: eDesc,
      inputs: [
        {
          type: 'radio',
          label: regular,
          value: "1",
          checked: this.spot.type == regular
        },
        {
          type: 'radio',
          label: waterline,
          value: "2",
          checked: this.spot.type == waterline
        },
        {
          type: 'radio',
          label: highline,
          value: "3",
          checked: this.spot.type == highline
        }
      ],
      buttons: [
        {
          text: cancel,
          role: "cancel"
        },
        {
          text: submit,
          handler: data =>{
            this.spot.type = typeArray[parseInt(data) - 1];
            this.spotsManager.editSpot(this.spot.ID, this.user.ID, data, "type", () => { this.event.publish('updatespot', {id: this.spot.ID}); });

            this.close();
          }
        }
      ]
    })
    alert.present();
  }

}
