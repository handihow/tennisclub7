import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import 'firebase/firestore';
import { auth } from 'firebase/app';


@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class SignupFormComponent implements OnInit {
  json: any;

  constructor(private firestore: AngularFirestore, public auth: AngularFireAuth) { }

  ngOnInit() {
  	this.json = {
	 "locale": "nl",
	 "title": "Aanmeldingsformulier Tennisclub7",
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
	      "Junior\t t/m 12 jaar  \t€   55,--    per jaar ",
	      "Junior\t13 t/m 14 jaar \t€   80,--    per jaar",
	      "Junior\t15 t/m 17 jaar\t€ 100,--    per jaar",
	      "Senior\t18 t/m 22 jaar\t€ 175,--    per jaar",
	      "Senior 22 tot 88+ jaar \t€ 215,--    per jaar ",
	      "Daglid senior\tmaandag t/m vrijdag spelen\t€ 160,--    per jaar"
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
	      "1",
	      "2",
	      "3",
	      "4",
	      "5",
	      "6",
	      "7",
	      "8",
	      "9"
	     ],
	     "colCount": 3
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
	      "1",
	      "2",
	      "3",
	      "4",
	      "5",
	      "6",
	      "7",
	      "8",
	      "9"
	     ],
	     "colCount": 3
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
  }

  login(){
  	this.auth.auth.signInAnonymously();
  }

}
