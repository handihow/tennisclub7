import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
const sgMail = require('@sendgrid/mail');
const dateFormat = require('dateformat');


export const sendEmails = functions.firestore.document('registrations/{id}').onWrite((change, context) => {
	const newValue = change.after.data();
	const previousValue = change.before.data();
	if(newValue && previousValue && newValue.isFinished && !previousValue.isFinished){
		//set the api key for sendgrid
		sgMail.setApiKey(functions.config().sendgrid.key);
		const data = newValue.data;
		const dynamicData = {
			  email: data.email,
	          firstName: data.firstName,
	          lastName: data.lastName,
	          gender: data.gender,
	          birthDate: dateFormat(data.birthDate, "d-m-yyyy"),
	          address: data.address,
	          postalCode: data.postalCode,
	          city: data.city,
	          mobilePhoneNumber: data.mobilePhoneNumber,
	          membershipType: data.membershipType,
	          date: dateFormat(data.date, "d-m-yyyy"),
	          imageUrl: data.image && data.image[0] && data.image[0].content ? data.image[0].content : 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
	          signedBy: data.signedBy,
	          placeSigned: data.placeSigned,
	          dateSigned: dateFormat(data.dateSigned, "d-m-yyyy"),
	          currentRatingSingles: data.currentRatingSingles ? data.currentRatingSingles : '-',
	          currentRatingDoubles: data.currentRatingDoubles ? data.currentRatingDoubles : '-'
        };
		const msgToNewMember = {
			// to: data.email,
			to: data.email,
			from: 'no-reply@tennisclub7.nl',
			fromname: 'Ledenadministratie Tennisclub7',
			templateId: 'd-06de23332fd04c43a1258a1c99f090bb',
			dynamic_template_data: dynamicData
		};
		const msgToAdministration = {
			to: 'roeland@handihow.com',
			from: 'no-reply@tennisclub7.nl',
			fromname: 'Ledenadministratie Tennisclub7',
			templateId: 'd-08a21deec3c9430ab552406395ed0c61',
			dynamic_template_data: dynamicData
		}
	    return sgMail.send(msgToAdministration)
		    .then(() => {
		    	return sgMail.send(msgToNewMember)
			    .then(() => {
			    	console.log('emails verstuurd');
			    	return true;
			    })
			    .catch((error:any) => {
			    	console.error(error.toString());
					return false;
			    })
		    })
		    .catch((error:any) => {
		    	console.error(error.toString());
				return false;
		    })
	} else {
		console.log('not sending email, the user is not yet finished');
		return false;
	}
	

})
