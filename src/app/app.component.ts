import { Component, OnInit, ViewEncapsulation } from '@angular/core';

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
export class AppComponent implements OnInit {
  title = 'Tennisclub7 inschrijven';

  json: any;
  result: any;
  surveyModel: any;
  sub: Subscription;
  userId: string;
  isDone: boolean;

  constructor(private db: AngularFirestore, public auth: AngularFireAuth, public storage: AngularFireStorage) { }

  ngOnInit() {
  	this.json = {
	 "locale": "nl",
	 "title": "Aanmeldingsformulier Tennisclub7",
	 "completedHtml": {
	  "nl": "<img alt='YES' src='https://tennisclub7.nl/wp-content/uploads/2016/03/Lake7-Zevensprong-1.png' width='100%' height='auto'><div style='padding:10px'><h3>Bedankt voor de aanmelding!</h3>\n<p>Je aanmelding is ontvangen en wordt automatisch verzonden naar de ledenadministratie. </p>\n<p>Je ontvangt een bevestiging van je aanmelding op het email adres dat je hebt opgegeven.</p>\n<p>De ledenadministratie zal contact met je opnemen zodra de aanmelding is verwerkt.</p></div>"
	 },
	 "pages": [
	  {
	   "name": "personalInformation",
	   "elements": [
	    {
	     "type": "radiogroup",
	     "name": "gender",
	     "title": "Geslacht",
	     "isRequired": true,
	     "choices": [
	      "Man",
	      "Vrouw",
	      "Genderneutraal"
	     ]
	    },
	    {
	     "type": "text",
	     "name": "date",
	     "startWithNewLine": false,
	     "title": "Lid per",
	     "isRequired": true,
	     "validators": [
	     	{
	     		"type": "expression", 
	     		"expression": "isDateMoreThanCurrent({date}) = true", 
	     		"text": "De datum mag niet in het verleden liggen"
	     	}
	     ],
	     "inputType": "date"
	    },
	    {
	     "type": "text",
	     "name": "lastName",
	     "title": {
	      "nl": "Achternaam"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "firstName",
	     "startWithNewLine": false,
	     "title": {
	      "nl": "Voornaam/voorletters"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "birthDate",
	     "title": {
	      "nl": "Geboortedatum"
	     },
	     "isRequired": true,
	     "inputType": "date"
	    }
	   ],
	   "title": "Persoonlijke gegevens"
	  },
	  {
	   "name": "addressInformation",
	   "elements": [
	    {
	     "type": "text",
	     "name": "address",
	     "title": {
	      "nl": "Adres en huisnummer"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "postalCode",
	     "title": {
	      "nl": "Postcode"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "city",
	     "startWithNewLine": false,
	     "title": {
	      "nl": "Woonplaats"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "mobilePhoneNumber",
	     "title": {
	      "nl": "Mobiel telefoonnummer"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "phoneNumber",
	     "startWithNewLine": false,
	     "title": {
	      "nl": "Telefoonnummer"
	     }
	    },
	    {
	     "type": "text",
	     "name": "email",
	     "title": {
	      "nl": "Email adres"
	     },
	     "isRequired": true,
	     "inputType": "email"
	    }
	   ],
	   "title": {
	    "nl": "Adres en contactgegevens"
	   }
	  },
	  {
	   "name": "membership",
	   "elements": [
	    {
	     "type": "radiogroup",
	     "name": "membershipType",
	     "title": {
	      "nl": "Als welk lid wenst u te worden ingeschreven"
	     },
	     "description": {
	      "nl": "Bepalend is de leeftijd die men in het kalenderjaar bereikt, e.e.a. conform richtlijnen KNLTB"
	     },
	     "isRequired": true,
	     "choices": [
	      "Junior t/m 12 jaar € 55,-- per jaar ",
	      "Junior 13 t/m 14 jaar € 80,-- per jaar",
	      "Junior 15 t/m 17 jaar € 100,-- per jaar",
	      "Senior 18 t/m 22 jaar € 175,-- per jaar",
	      "Senior 22 tot 88+ jaar € 215,-- per jaar ",
	      "Daglid senior maandag t/m vrijdag spelen € 160,-- per jaar"
	     ]
	    },
	    {
	     "type": "radiogroup",
	     "name": "currentRatingSingles",
	     "title": {
	      "nl": "Speelsterkte enkel"
	     },
	     "description": {
	      "nl": "Laat leeg als je jouw speelsterkte niet weet"
	     },
	     "choices": [
	      "3",
	      "4",
	      "5",
	      "6",
	      "7",
	      "8",
	      "9",
	      "weet niet"
	     ],
	     "colCount": 2
	    },
	    {
	     "type": "radiogroup",
	     "name": "currentRatingDoubles",
	     "startWithNewLine": false,
	     "title": {
	      "nl": "Speelsterkte dubbel"
	     },
	     "description": {
	      "nl": "Laat leeg als je jouw speelsterkte niet weet"
	     },
	     "choices": [
	      "3",
	      "4",
	      "5",
	      "6",
	      "7",
	      "8",
	      "9",
	      "weet niet"
	     ],
	     "colCount": 2
	    }
	   ],
	   "title": {
	    "nl": "Lidmaatschap"
	   }
	  },
	  {
	   "name": "picture",
	   "elements": [
	    {
	     "type": "file",
	     "name": "image",
	     "title": {
	      "nl": "Pasfoto"
	     },
	     "description": {
	      "nl": "Upload een recente pasfoto voor je ledenpas"
	     },
	     "storeDataAsText": true,
	     "isRequired": true,
	     "imageWidth": "150",
	     "acceptedTypes": "image/*",
	     "waitForUpload": true,
	     "maxSize": 10240000
	    }
	   ],
	   "title": {
	    "nl": "Pasfoto"
	   }
	  },
	  {
	   "name": "signatures",
	   "elements": [
	    {
	     "type": "text",
	     "name": "dateSigned",
	     "title": {
	      "nl": "Datum ondertekening"
	     },
	     "isRequired": true,
	     "validators": [
	     	{
	     		"type": "expression", 
	     		"expression": "isDateMoreThanCurrent({dateSigned}) = true", 
	     		"text": "De datum mag niet in het verleden liggen"
	     	}
	     ],
	     "inputType": "date"
	    },
	    {
	     "type": "text",
	     "name": "placeSigned",
	     "title": {
	      "nl": "Plaats ondertekening"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "text",
	     "name": "signedBy",
	     "title": {
	      "nl": "Ondertekend door"
	     },
	     "description": {
	      "nl": "De ouder/verzorger voor leden jonger dan 18 jaar ondertekenen voor nieuwe jeugdleden"
	     },
	     "isRequired": true
	    },
	    {
	     "type": "signaturepad",
	     "name": "signature",
	     "storeDataAsText": false,
	     "title": {
	      "nl": "Handtekening"
	     },
	     "isRequired": true
	    }
	   ],
	   "title": {
	    "nl": "Ondertekening"
	   }
	  }
	 ],
	 "showQuestionNumbers": "off"
	}
	this.auth.authState.subscribe(user => {
		if(user){
			this.userId = user.uid;
	  		this.fetchUserResults();
	  		this.initiateSurvey();
		}
	})

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



