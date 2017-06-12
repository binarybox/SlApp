import { Component, ViewChild } from '@angular/core';
import { Nav, Events, MenuController, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from "@ionic-native/status-bar"
import { SpotsManager } from '../providers/spot-manager';

import { MapPage } from '../pages/map/map';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';

import { URL, User } from "./main";

import { Http } from '@angular/http';
import { NativeStorage } from '@ionic-native/native-storage';

import {TranslateService} from 'ng2-translate';

declare var cordova: any;

@Component({
  templateUrl: 'app.html',
  providers: [SpotsManager, SplashScreen]
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  loader;
  url: URL = new URL();
  rootPage: any;

  pages: Array<{}>;

  spotsManager: SpotsManager;
  user: User;
  role: number;

  constructor(private splash: SplashScreen, translate: TranslateService,private storage: NativeStorage,public platform: Platform, public http: Http, public spotManager: SpotsManager, public events: Events, public menuCtrl: MenuController) {
    this.spotsManager = spotManager;
    this.initializeApp();
    this.role = 100;
    //storage.clear();
    menuCtrl.enable(false);
    this.storage.getItem("user").then((data) => {
      if(data != null){
        this.role = data.role;
        this.user = data;
      }
    })
    events.subscribe('userloggedin', (data) => {
      this.user = data;
      this.role = data.role;
    })

    events.subscribe('userlogout', () => {
      this.user = null;
      this.role = 100;
    })

    translate.setDefaultLang("en");

    translate.use(platform.lang());

    this.pages = [
      {title: "Settings", page: SettingsPage},
      {title: "About", page: AboutPage},
    ]

  }

  initializeApp() {
    //var initializeSlides = this.initialize();
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //StatusBar.styleLightContent();
      this.storage.getItem('user').then((val) => {
        this.splash.hide()
        this.nav.setRoot(MapPage);
      });
    });
  }

  close(event?){
    this.menuCtrl.close();
  }

  addSpot(event?){
    this.events.publish("addSpotclicked", event);
    this.menuCtrl.close();
    // TODO call event to create marker
  }

  goto(page){
    this.menuCtrl.close();
    this.nav.push(page);
  }
}
