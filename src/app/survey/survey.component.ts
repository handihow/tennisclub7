import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import * as Survey from 'survey-angular';
import * as widgets from 'surveyjs-widgets';

import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';

//widgets.emotionsratings(Survey);
widgets.signaturepad(Survey);

Survey.JsonObject.metaData.addProperty('questionbase', 'popupdescription:text');
Survey.JsonObject.metaData.addProperty('page', 'popupdescription:text');

Survey.StylesManager.applyTheme("bootstrap");

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'survey',
  template: `<div class='survey-container contentcontainer codecontainer'><div id='surveyElement'></div></div>`
})
export class SurveyComponent implements OnInit {
  @Output() submitSurvey = new EventEmitter<any>();
  @Input()
  json: object;
  result: any;

  constructor(private storage: AngularFireStorage){}

  ngOnInit() {
    var myCss = {
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

    const surveyModel = new Survey.Model(this.json);
    surveyModel.onAfterRenderQuestion.add((survey, options) => {
      if (!options.question.popupdescription) { return; }
      // Add a button;
      const btn = document.createElement('button');
      btn.className = 'btn btn-info btn-xs';
      btn.innerHTML = 'More Info';
      btn.onclick = function () {
        // showDescription(question);
        alert(options.question.popupdescription);
      };
      const header = options.htmlElement.querySelector('h5');
      const span = document.createElement('span');
      span.innerHTML = '  ';
      header.appendChild(span);
      header.appendChild(btn);
    });
    surveyModel.onUploadFiles
      .add(async (survey, options) => {
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
    surveyModel.onComplete
      .add((result, options) => {
        console.log(result.data);
      });
    Survey.SurveyNG.render('surveyElement', { model: surveyModel, css: myCss });
  }
  
}