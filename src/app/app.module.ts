import { NgModule, ErrorHandler, } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { Transfer } from '@ionic-native/transfer'
import { NativeStorage } from '@ionic-native/native-storage'

import { TranslateModule, TranslateLoader, TranslateStaticLoader } from 'ng2-translate';

import { MyApp } from './app.component';
import { MapPage } from '../pages/map/map';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { SpotDetailsPage } from '../pages/spot-details/spot-details';
import { NewSpotDetailsPage } from '../pages/new-spot-details/new-spot-details'
import { EditSpotPopoverPage } from '../pages/edit-spot-popover/edit-spot-popover';
import { ChangePasswordPage } from '../pages/change-password/change-password';


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    MapPage,
    SettingsPage,
    SpotDetailsPage,
    NewSpotDetailsPage,
    EditSpotPopoverPage,
    AboutPage,
    ChangePasswordPage
  ],
  imports: [
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    IonicModule.forRoot(MyApp),
    BrowserModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    MapPage,
    SettingsPage,
    SpotDetailsPage,
    NewSpotDetailsPage,
    EditSpotPopoverPage,
    AboutPage,
    ChangePasswordPage
  ],
  providers: [
    Transfer,
    NativeStorage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
