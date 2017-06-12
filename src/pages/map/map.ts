import { Component, trigger, state, style, transition, animate } from '@angular/core';
import { NavController, NavParams, MenuController, PopoverController, Events } from 'ionic-angular';

import { Http } from '@angular/http';
import { SpotsManager } from '../../providers/spot-manager';
import { SpotDetailsPage } from '../spot-details/spot-details';
import { NewSpotDetailsPage } from '../new-spot-details/new-spot-details';
import { User } from "../../app/main";
import { Geolocation } from '@ionic-native/geolocation';

import * as L from 'leaflet';

import { NativeStorage } from '@ionic-native/native-storage';


let tmpMarker: L.Marker = null;
/*
  Generated class for the Map page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  providers: [SpotsManager, Geolocation],
  animations: [
    trigger('details', [
      state('out', style({
        transform: 'translateY(0)'
      })),
      state('in', style({
        transform: 'translateY(-100%)'
      })),
      transition('* => *', [
        animate('500ms ease')
      ])
    ])
  ]
})

export class MapPage {
  private map: L.Map;
  spotsManager: SpotsManager;
  spot =  {ID: -1, length: 0, type: 0, description: "", images: Array<{src: string, title: string}>() , pro: "0", con: "0", votes: 0, amount: 100};
  private user: User;
  private spotDetails = "out";
  private newSpotDetails = "out";
  private showLocation: boolean = false;
  private currentPos: L.LatLng = null;
  //private tmpMarker: L.Marker = null;

  constructor(private geolocation: Geolocation, public events: Events, public popoverCtrl: PopoverController, public navCtrl: NavController, public navParams: NavParams, private storage: NativeStorage, public http: Http, public spotManager: SpotsManager, public menuCtrl: MenuController) {
    this.http = http;
    this.spotsManager = spotManager;
    events.subscribe('markerclicked', (id) => {
      //this.spotsManager.re(this.map);
      if(this.spotDetails == 'in'){
        this.spotDetails = 'out';
        setTimeout((e) => {
          this.spot = spotManager.getData(id);
          this.spot.votes = parseInt(this.spot.pro) + parseInt(this.spot.con);
          this.spot.amount = (parseInt(this.spot.pro) / ( parseInt(this.spot.pro) + parseInt(this.spot.con) ) ) * 100;
          this.spotDetails = 'in';
        },500);
      }
      else{
        this.spot = spotManager.getData(id);
        this.spot.votes = parseInt(this.spot.pro) + parseInt(this.spot.con);
        this.spot.amount = (parseInt(this.spot.pro) / ( parseInt(this.spot.pro) + parseInt(this.spot.con) ) ) * 100;
        this.spotDetails = "in";
      }
    })

    events.subscribe('spotremoved', (data) =>{
      this.spotDetails = 'out';
      this.spotManager.removeFromMap(data['id'], this.map);
      this.navCtrl.pop();
    })

    events.subscribe('updatespot', (data) =>{
      this.spotManager.removeFromMap(data['id'], this.map);
      this.spotsManager.getSpotsFromServer(this.map);
    })

    events.subscribe('addSpotclicked', (data) =>{
      this.spotDetails = 'out';
      this.newSpotDetails = "in";
      this.storage.remove('spot');
      if(tmpMarker == null){
        var pos = this.map.getCenter();
        tmpMarker = L.marker([pos.lat, pos.lng]).addTo(this.map);
        this.map.addEventListener('move', this.changeMarkerPos);
      }
    })

    events.subscribe('spotUploaded', () => {
      //this.spotManager.removeAllMarkers(this.map);
      this.spotManager.getSpotsFromServer(this.map);
      this.navCtrl.pop();
      //this.map.removeEventListener('move', this.changeMarkerPos)
      if(tmpMarker != null){
        this.map.removeLayer(tmpMarker)
        tmpMarker = null;
      }
      this.newSpotDetails = "out";
    });

    events.subscribe('voteUpdate', (votes) => {
      this.spot.con = votes.con;
      this.spot.pro = votes.pro;
      this.spot.votes = votes.votes;
      this.spot.amount = (parseInt(this.spot.pro) / ( parseInt(this.spot.pro) + parseInt(this.spot.con) ) ) * 100;
    })
  }

  changeMarkerPos(e){
    if(tmpMarker != null ){
      let object = e.target.getCenter();
      let center = L.latLng(object.lat, object.lng);
      // set Marker to the center of the map
      tmpMarker.setLatLng(center)
    }
  }

  cancelNewSpot(){
    //this.storage.remove('newSpot')
    this.map.removeEventListener('move', this.changeMarkerPos)
    if(tmpMarker != null){
      this.map.removeLayer(tmpMarker)
      tmpMarker = null;
    }

    this.newSpotDetails = "out";
  }

  goToLocation(){

    this.map.flyTo(this.currentPos, 13)
  }

  showNewSpotDetails(){
    this.navCtrl.push(NewSpotDetailsPage);
  }

  closeDetails(){
    this.spotDetails = "out";
    //this.spot =  {ID: -1, length: 0, type: 0, description: "", images: Array<{src: string, title: string}>() };
  }

  showDetails(){
    this.navCtrl.push(SpotDetailsPage, {spot: this.spot, user: this.user});
  }

  voteUp(){
    this.spotManager.vote(this.user.ID, this.spot.ID,  1);
  }

  voteDown(){
    this.spotManager.vote(this.user.ID, this.spot.ID, 0);
  }


  ionViewDidLeave() {
    this.menuCtrl.get('map-menu').swipeEnable(false);
    this.menuCtrl.enable(false);
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(true);
    if(this.map != null){
      this.map.invalidateSize(true);
    }
    this.storage.getItem('user').then((user: User) => {
      this.user = user;
    })
  }


  ionViewDidLoad() {
    this.setPosition(this);
    //console.log(this.user)

  }

  createMap( lat: number, lng: number, mapPage: MapPage){

    if(mapPage.map != null){
      mapPage.map.remove()
      this.spotManager.clear();
    }

    mapPage.map = L.map('map')
      .setView([lat, lng], 13);

   L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-basic/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: '',
      zoomControl: "false",
      attributionControl: false,
      accessToken: 'pk.eyJ1IjoiZGFnZ2VsaXRvIiwiYSI6ImNpeWRrcGN3bDAwOWEzMnBmZGdzeW4wZHQifQ.K2_wXA1ucbmGxm9wkuAtqA'
    }).addTo(mapPage.map);

    mapPage.spotsManager.getSpotsFromServer(mapPage.map);

    mapPage.map.on('mouseup', function(e){

      var pos = mapPage.map.getCenter()
      //console.log(pos);
      mapPage.spotsManager.getSpotsFromServer(mapPage.map);
      mapPage.storage.setItem('position', [pos.lat, pos.lng]);
    })

    mapPage.map.on("click", (e) => {
      this.spotDetails = "out";
    })

    //mapPage.spotsManager.spotDetails(mapPage.map);

    mapPage.watchUserPosition(mapPage);
  }

  setPosition(mapPage: MapPage){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        function(position){

          mapPage.storage.setItem('position', [position.coords.latitude, position.coords.longitude]);
          mapPage.createMap(position.coords.latitude, position.coords.longitude, mapPage);
        },
        function(e){
          mapPage.storage.getItem('position').then((pos) => {
            if(pos != null){
              mapPage.createMap(pos[0], pos[1], mapPage);
            }
            else{
              mapPage.createMap(0, 0, mapPage);
            }
          })
        }, {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true}
      )
    }
  }

  watchUserPosition(mapPage: MapPage){
    let userMarkerStyle = L.divIcon({
         className: 'map-marker',
         iconSize:null,
         html:'<div class="icon"></div>'
       });
    let userMarker = L.marker([0.0,0.0], {icon: userMarkerStyle});
    let added = false;
    let watch = this.geolocation.watchPosition({maximumAge: 3000, timeout: 5000, enableHighAccuracy: true})
    watch.subscribe((data) => {
        if(data.coords != null){
          if(!added){
            userMarker.addTo(mapPage.map);
            added = true;
            mapPage.showLocation = true;
          }
          mapPage.currentPos = L.latLng(data.coords.latitude, data.coords.longitude)
          userMarker.setLatLng(L.latLng(data.coords.latitude, data.coords.longitude));
        }
        else{
          if(added){
            mapPage.map.removeLayer(userMarker);
            added = false;
            mapPage.showLocation = false;
          }
        }
       // data can be a set of coordinates, or an error (if an error occurred).
       // data.coords.latitude
       // data.coords.longitude
     })

  }

}
