import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import 'firebase/firestore';
import 'firebase/storage';
import { auth } from 'firebase/app';

import * as Survey from 'survey-angular';
import * as widgets from 'surveyjs-widgets';

import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';

import { Subscription } from 'rxjs';

widgets.signaturepad(Survey);

Survey.JsonObject.metaData.addProperty('questionbase', 'popupdescription:text');
Survey.JsonObject.metaData.addProperty('page', 'popupdescription:text');

Survey.StylesManager.applyTheme("bootstrap");

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Tennisclub7 inschrijven';

  json: any;
  result: any;
  surveyModel: any;
  form: Subscription;
  sub: Subscription;
  userId: string;
  isDone: boolean;

  constructor(private db: AngularFirestore, public auth: AngularFireAuth, public storage: AngularFireStorage) { }

  ngOnInit() {
 	this.auth.authState.subscribe(user => {
		if(user){
			this.form = this.db.collection('forms').doc('registration').valueChanges().subscribe((form: any) => {
		 		if(form){
		 			this.json = form.json;
		 			this.userId = user.uid;
			  		this.fetchUserResults();
			  		this.initiateSurvey();
		 		}
		 	});
		}
	})
  }

  ngOnDestroy() {
  	if(this.sub && !this.sub.closed){
  		this.sub.unsubscribe();
  	}
  	if(this.form && !this.form.closed){
  		this.form.unsubscribe();
  	}
  }

  login(){
  	this.auth.signInAnonymously()
  }

  logout(){
  	this.auth.signOut()
  	this.isDone = false;
  }


  fetchUserResults(){
  	if(typeof this.userId === 'string'){
      this.sub = this.db.collection('registrations').doc(this.userId).valueChanges().subscribe((result:any) => {
        if(result && result.isFinished){
          this.sub.unsubscribe();
          this.surveyModel.data = result.data;
          this.surveyModel.doComplete();
        } else if(result && result.data){
          this.surveyModel.data = result.data;
          this.surveyModel.currentPageNo = result.currentPage;
        }
      })
    }
  }

  initiateSurvey(){
  	const myCss = {
        page: {
          'title': 'page-title',
        },
        navigationButton: "btn btn-lg",
        navigation: {
          "complete": "btn-primary",
          "prev": "btn-secondary",
          "next": "btn-primary",
          "start": "btn-primary"
        },
        paneldynamic: {
        	"buttonAdd": "btn-success",
        	"buttonRemove": "btn-danger"
        }

    };

    this.surveyModel = new Survey.Model(this.json);
    this.surveyModel.onCurrentPageChanged.add(result => {
      if(typeof this.userId ==='string'){
        this.db.collection('registrations').doc(this.userId).set({
          isFinished: false, 
          data: result.data,
          currentPage: this.surveyModel.currentPageNo,
          updatedAt: new Date().toISOString(),
          id: this.userId
        })
      }
    });
    this.surveyModel.onUploadFiles.add(async (survey, options) => {
        console.log('uploading file..')
          let file = options.files[0];
           if (file.type.split('/')[0] !== 'image') { 
            window.alert('Geen geldig beeldformaat. Upload een file met een beeldformaat, bijvoorbeeld jpg')
            return;
          }

          const storagePathPrefix='images/'
          const dateTime = new Date().getTime();
          const filename = "_" + file.name;
          // The storage path
          const path = storagePathPrefix + dateTime + filename;

          const result = await this.storage.upload(path, file);
          if(result.state !== 'success'){
            window.alert('Er ging iets mis bij het uploaden van de file. Probeer het aub opnieuw');
            return;
          }

          const downloadUrl = this.storage.ref(path).getDownloadURL().subscribe(url => {
            const returnedFiles = [];
            returnedFiles.push({file: file, content: url});
            options.callback("success", returnedFiles);
            return returnedFiles;
          });
      });
    this.surveyModel
    .onAfterRenderQuestion
    .add(function (survey, options) {
        if (options.question.inputType === "date" && options.question.isEmpty() && options.question.name !== 'birthDate') {
          options.question.value = new Date().toISOString().substring(0, 10);
        }
    });
    this.surveyModel.onComplete
      .add((result, options) => {
        if(typeof this.userId ==='string'){
          this.db.collection('registrations').doc(this.userId).set({
            isFinished: true, 
            data: result.data,
            currentPage: this.surveyModel.currentPageNo,
            updatedAt: new Date().toISOString(),
            id: this.userId
          })
          .then(_ => this.isDone = true);
        }
      });
    Survey.FunctionFactory.Instance.register("isDateMoreThanCurrent", this.isDateMoreThanCurrent);
    Survey.SurveyNG.render('surveyElement', { model: this.surveyModel, css: myCss });
  }


  isDateMoreThanCurrent(params) {
      if(params.length < 1) return false;
      var date = params[0];
      var currentDate = new Date();
      if(typeof date == "string") date = Date.parse(date);
      return date >= currentDate.setDate(currentDate.getDate() - 1);
  }

}



