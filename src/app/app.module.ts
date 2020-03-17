import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';

import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';
import { SignupFormComponent } from './signup-form/signup-form.component';

import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';

import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { SurveyComponent } from './survey/survey.component';


@NgModule({
  declarations: [
    AppComponent,
    SignupFormComponent,
    SurveyComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  entryComponents: [
  	SignupFormComponent
  ]

})
export class AppModule { 
	constructor(private injector: Injector){}

	ngDoBootstrap(){
		
		const el = createCustomElement(SignupFormComponent, { injector: this.injector });

		customElements.define('signup-form', el);
	}
}
