import { Injectable } from '@angular/core';
import { Events, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { URL } from '../app/main';
import { Transfer } from '@ionic-native/transfer';

import { NativeStorage } from '@ionic-native/native-storage';
import {TranslateService} from 'ng2-translate';
import { TranslatLoader } from './trans-loader'

import * as L from 'leaflet';

import 'rxjs/add/operator/map';

declare var cordova: any;
var typeNames = ["regular", "waterline", "highline"];

/*
  Generated class for the SpotManager provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SpotsManager{
  public url: URL = new URL();
  private spots = [];
  private points: L.Marker[] = [];
  private transLoader: TranslatLoader;

  constructor(
    private transfer: Transfer,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadCtrl: LoadingController,
    private storage: NativeStorage,
    public event: Events,
    public http: Http){
    this.transLoader = new TranslatLoader(toastCtrl, translate, loadCtrl, alertCtrl);
  }

  clear(){
    this.points = [];
    this.spots = [];
  }

  /***
  * returns the spot with the id if it is already loaded in the array.
  * If the id does not exist it will return false
  ***/
  public getData(id: number){
    if(this.spots[id] != null){
      return this.spots[id];
    }
    else{
      return false;
    }
  }

  /***
  * remove all markers from the map and clears the points and spots array;
  ***/
  public removeAllMarkers(map: L.Map){
    for(let p of this.points){
      if(p != null){
        p.remove();
      }
    }
    this.points = [];
    this.spots = [];
  }

  /***
  * removes marker from map
  ***/
  public removeFromMap(id: number, map: L.Map){
    this.spots[id] = null;
    this.points[id].remove();
    this.points[id] = null;
  }

  /**
  * append the spots from the current screen to the spots and points array.
  **/
  public getSpotsFromServer(map){

    var events = this.event;
    var bounds = map.getBounds();
    var north = bounds.getNorth();
    var south = bounds.getSouth();
    var east = bounds.getEast();
    var west = bounds.getWest();

    var data = JSON.stringify({latMax: north, latMin: south, lonMax: west, lonMin: east});
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // check the current frame for spots and get them from the server
    this.http.post(this.url.getSpot(), data, headers).subscribe(res => {
      if(res['_body'] != ""){
        var response = JSON.parse(res['_body']);
        // if there is a error on the server it will set 'error' to the message
        if(!res['error']){
          // add each spot wich is not already in the spots array to the spots array and add it to the map
          for(var i = 0; i < response.spots.length; i++){

            var spot = response.spots[i];

            let oldTime: Date;
            let newTime: Date;
            // if the spot got updated since the last load delete the old spot and set the spot new
            if(this.spots[spot.ID] != null){
              oldTime = new Date(this.spots[spot.ID].last_edit);
              newTime = new Date(spot.last_edit);
              if(oldTime < newTime){
                this.removeFromMap(spot.ID, map);
              }
            }
            if(this.spots[spot.ID] == null){
              this.spots[spot.ID] = spot;
              // add the marker to the map with the class for the spot Type
              let point = L.marker(
                [parseFloat(spot.lat), parseFloat(spot.lon)],
                {icon: getMarkerClass(spot.ID, parseInt(spot.type))}
              ).addTo(map);

              this.points[spot.ID] = point;
              point['options']['db-id'] = parseInt(spot.ID);
              spot.type = typeNames[spot.type - 1];
              // translate the type of the spot
              this.translate.get(spot.type).subscribe((res: string) => { this.spots[spot.ID].type = res});
              point.addEventListener("click", function(e){
                events.publish("markerclicked", this['options']['db-id']);
                return false;
                //openDetailsForSpot($(this._icon).find(".icon").data('marker-id'))
              })
            }
          }

        }
        else{
          this.transLoader.presentToast(response["error"]);
        }

      }
    }, error => {
      console.log(error);
    })
  }

  /***
  * load the images url from the server in the needed resolution and push it to the destination array
  ***/
  public loadImages(id: number, res: number[], spot){

    var data = JSON.stringify({ID: id, res: res});

    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.url.getImages(), data, headers).subscribe((res) => {
      let result = JSON.parse(res['_body']);
      spot.imgLoaded = true;
      this.setupImages(result, spot.images);

    }, (error) =>{
      console.log(error)
    })
  }

  setupImages(result, images){
    for(var i = 0; i < result.length; i++){
      var tmpElement = result[i]
      tmpElement.url = this.url.getImgFolder() + tmpElement.url;
      tmpElement.loaded = false;
      images.push(tmpElement);
    }

  }

  /***
  * send the spot to the server to store it and call the "spotUploaded" event afterwards
  ***/
  registerSpot(spot: {length: number, name: string, type: number, description: string, images: Array<{src: string, title: string}> }){
    if(spot.length != null && spot.type != null){
      this.storage.getItem('position').then((pos) => {
        this.storage.getItem('user').then((user) => {

          this.transLoader.present("Please wait...");

          let uploadData = JSON.stringify({
              latitude: pos[0],
              longitude: pos[1],
              length: spot.length,
              description: spot.description,
              type: spot.type,
              creator: user.ID,
              name: spot.name
            })

          let headers = new Headers();
          headers.append('Content-Type', 'application/json');

          this.http.post(this.url.getRegisterSpot(), uploadData, headers).subscribe((res) => {
            let result = JSON.parse(res['_body'])

            if(result['error'] == null){
              this.transLoader.dismiss('spotUploaded');
              if(spot.images.length > 0 ){
                for(let i = 0; i < spot.images.length; i++){
                  this.uploadImg(spot.images[i].src, spot.images[i].title, user.ID, result['id'], () => {this.event.publish('spotUploaded')})
                }
              }
              else{
                this.event.publish('spotUploaded');
              }
            }
            else{
              let err = "Error"
              this.translate.get("Error").subscribe((res: string) => {err = res});

              this.transLoader.dismiss();
              let alert = this.alertCtrl.create({title: err, subTitle: result['error'], buttons: ['Dismiss']})
              alert.present();
            }
          }, (error) => {
            //let result = JSON.parse(error['_body'])
            console.log(error)
            this.transLoader.dismiss();
            //let alert = this.alertCtrl.create({title: 'Error', subTitle: result['error'], buttons: ['Dismiss']})
            //alert.present();
          })
          })
      })
    }
  }

  /***
  * upload Image to the server.
  * when start open a loading dialog which says "Upload image. Please wait..." and close it when the Image got uploaded or an error occured.
  * After the image was sucessfull uploaded a toas appears wich says "Image uploaded" in the language of the user.
  ***/
  public uploadImg(fullPath, name, userID, spotID, func?: Function){
    this.transLoader.present("Upload image. Please wait...");

    let options = {
      fileKey: "file",
      fileName: name,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params: {'fileName': name, 'creator': userID, 'spotID': spotID}
    };

    const fileTransfer = this.transfer.create();

    fileTransfer.upload(fullPath, this.url.getUploadImage(), options).then(
      (data) => {
        this.transLoader.dismiss("Image uploaded");

        func();

      }, error => {
        this.transLoader.dismiss("Error");
      })
  }

  /***
  * remove the spot from the map and present the event "spotremoved" when the spot was removed on the server.
  * Present a loader until the server returns that the spot was removed or an error occuerred
  * when the spot was removed the loader will be dismissed and a toast appears which says "Spot removed" in the user language
  ***/
  removeSpot(id, userID){
    // translate the messages for the loader and toast.
    this.transLoader.present("Remove spot. Please wait...")

    // after the loader is presented prepare the post to server
    let data = JSON.stringify({
        ID: id,
        userID: userID
      })
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.url.removeSpot(), data, headers).subscribe((res) => {
      let result = JSON.parse(res['_body'])
      if(result['removed']){
        console.log(result)
        this.event.publish('spotremoved', {id: id});
        this.transLoader.dismiss("Spot removed");
      }
      else{
        this.transLoader.dismiss("Oh, something went wrong");
      }
    }, (err) => {
      this.transLoader.dismiss();
      console.log(err)
    })

  }

  /***
  * edit the variable from type of the spot and when the server respondes without an error a toast will appear and the func() will be called.
  * Example: type = "description" => the description variable of the spot with the id will be set to newValue
  *
  ***/
  editSpot(id, userID, newValue, type, func = () => {}){
    this.transLoader.present("Please wait...")
    let data = JSON.stringify({
        ID: id,
        userID: userID,
        newVal: newValue,
        type: type
      })
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.url.editSpot(), data, headers).subscribe((res) => {
      let result = JSON.parse(res['_body'])
      if(result['success']){
        this.transLoader.dismiss(type + " changed")
        func()
      }
      else{
        this.transLoader.dismiss(result['error']);
      }
    }, (err) => {
      console.log(err)
      this.transLoader.dismiss();
    })
  }

  /**
   To vote for a spot. If the user wants to vote he also can add a comment to the spot.
  **/
  public vote(user, spot, vote){
    let alert = this.alertCtrl.create({
      title: "Comment",
      message: "Please comment this spot.",
      inputs: [
        {
          name: "comment",
          placeholder: "Comment"
        },
      ],
      buttons: [
        {
          text: "Cancel",
        },
        {
          text: "Submit",
          handler: tmp => {
            this.transLoader.present("Please wait...")
            let data = JSON.stringify({
                userID: user,
                spotID: spot,
                text: tmp.comment,
                vote: vote
              })
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');

            this.http.post(this.url.getVoteSpot(), data, headers).subscribe((res) => {
              let result = JSON.parse(res['_body'])
              if(!result["error"]){
                console.log(result)
                let votes = {pro: 0, con: 0, votes: 0}
                for(let i = 0; i < result.length; i++){
                  if(result[i].vote == 1){
                    votes.pro += 1;
                  }
                  else{
                    votes.con += 1;
                  }
                  votes.votes += 1;
                }
                this.event.publish("voteUpdate", votes);
                this.transLoader.dismiss("comment uploaded");

              }
              else{
                this.transLoader.alert("Error", result);
              }
            }, (err) => {
              console.log(err)
              this.transLoader.dismiss();
            })
          }
        }
      ]
    })
    alert.present();

  }

  public getVotesBySpot(id){
    let http = this.http;
    let transLoader = this.transLoader;
    let url = this.url.getVotesForSpot();
    return new Promise(function (resolve, reject ) {
      let data = JSON.stringify({
          spot: id,
        })
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      http.post(url, data, headers).subscribe((res) => {
        let result = JSON.parse(res['_body'])
        if(!result["error"]){
          return resolve(result);
          // returns array with votes.
          // every array element contains comment, date, spot, user, vote
          // spot is the spotID
          // user is the creatorID
          // the comment is the comment Text
          // vote is 1 or -1 for plus or minus
          // date is the last edit
        }
        else{
          transLoader.alert("Error", result['error']);
          return reject("error");
        }
      }, (err) => {
        console.log(err)
        reject("error");
      })
    })

  }
}


function getMarkerClass(id, type){
  var spotStyle = [
    L.divIcon({ // regular marker style
         className: "regular-marker",
         iconSize: [28, 41],
       }),
       L.divIcon({ // regular marker style
            className: "waterline-marker",
            iconSize: [28, 41],
          }),
          L.divIcon({ // regular marker style
               className: "highline-marker",
               iconSize: [28, 41],
             }),
  ]
  return spotStyle[type-1];
}
