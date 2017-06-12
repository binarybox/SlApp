import { Component, trigger, state, style, animate, transition  } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, PopoverController, Events, LoadingController } from 'ionic-angular';
import { SpotsManager } from '../../providers/spot-manager';
import { ImageManager } from '../../providers/image';
import { User } from '../../app/main';
import { PhotoViewer } from '@ionic-native/photo-viewer';

import { EditSpotPopoverPage } from '../edit-spot-popover/edit-spot-popover';

import {TranslateService} from 'ng2-translate';

/*
  Generated class for the SpotDetails page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-spot-details',
  templateUrl: 'spot-details.html',
  providers: [SpotsManager, ImageManager],
  animations: [
    trigger('hidden', [
      state('true', style({
        display: "none",
        opacity: 0.0
      })),
      state('false', style({
        opacity: 1.0,
        display: "block"
      })),
      transition('1 => *', animate('400ms ease'))
    ])
  ]
})
export class SpotDetailsPage {
  user: User;
  permission: boolean;
  class1: string = "class1";
  class2: string = "class2";

  spot =  {ID: -1, length: 0, type: 0, description: "", creator: 0, images: Array<{src: string, url: string, title: string}>(), imgLoaded: false, pro: 0, con: 0, amount: 0, votes: 0 };
  comments;
  constructor(private photoViewer: PhotoViewer, public loadCtrl: LoadingController, public imgManager: ImageManager, public events: Events, public popCtrl: PopoverController, public translate: TranslateService, public alertCtrl: AlertController, public spotManager: SpotsManager, public navCtrl: NavController, public navParams: NavParams, public platform: Platform) {
    this.spot = navParams.get('spot');
    if(navParams.get('user') != null){
      this.user = navParams.get('user');
    }
    spotManager.getVotesBySpot(this.spot.ID).then((data) => {this.comments = data; console.log(this.comments)});

    if(this.user != null){
      // check if the current user has permission to edit or remove this spot
      this.permission = ((this.spot.creator == this.user.ID) || (this.user.role < 2));
    }
    else{
      this.permission = false;
    }

    // check screen size to get the images in the correct dimension
    let width = platform.width() * window.devicePixelRatio;
    let res: number[] = [width * 0.75, width * 0.75];
    this.spot.images = []
    spotManager.loadImages(this.spot.ID, res,  this.spot);

    this.events.subscribe('refresImages', () => {
      this.spot.images = [];
      spotManager.loadImages(this.spot.ID, res, this.spot);
    })

    events.subscribe('voteUpdate', (votes) => {
      this.spot.con = votes.con;
      this.spot.pro = votes.pro;
      this.spot.votes = votes.votes;
      this.spot.amount = (this.spot.pro / ( this.spot.pro + this.spot.con ) ) * 100;
      spotManager.getVotesBySpot(this.spot.ID).then((data) => {this.comments = data; console.log(this.comments)});
    })

  }

  showImage(img){
    // open Image fullscreen after touch it
    // replace is needed because the url is for the croped image
    this.photoViewer.show(img.url.replace(/_[0-9]*x[0-9]*/g, ""));
  }

  removeImage(img){
    let deleteTxt = "delete picture";
    let areYouSure = "Are you sure you want to delete this picture?";
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
          if(this.user != null){
            this.imgManager.removeImg(img.ID, this.user.ID)
          }
        }
      }
      ]
    })
    alert.present()
  }

  imgLoaded(p){
    p.loaded = true;
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
          if(this.user != null){
            this.spotManager.removeSpot(this.spot.ID, this.user.ID);
          }
        }
      }
      ]
    })
    alert.present()
  }


    voteUp(){
      this.spotManager.vote(this.user.ID, this.spot.ID,  1);
    }

    voteDown(){
      this.spotManager.vote(this.user.ID, this.spot.ID, 0);
    }

  openPopover(){

    let popover = this.popCtrl.create(EditSpotPopoverPage, {spot: this.spot, user: this.user});
    popover.present()
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SpotDetailsPage');
  }

}
