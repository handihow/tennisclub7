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
		let attachments = [];
		try{
			const image = data.image;
			const signature : string = data.signature;
			const signatureBase64 = signature.split(',')[1];
			const signatureFileType = signature.split(',')[0].split(';')[0].split(':')[1];
			const signatureFileName = data.firstName + '_' + data.lastName + '_' + 'handtekening.png'
			attachments.push({
		      content: image[0].content.split(',')[1],
		      filename: image[0].name,
		      type: image[0].type,
		      disposition: "attachment"
		    });
		    attachments.push({
		    	content: signatureBase64,
		    	filename: signatureFileName,
		    	type: signatureFileType,
		    	disposition: "attachment"
		    });
		} catch(e){
			console.error(e.toString());
		}
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
			dynamic_template_data: dynamicData,
			attachments: attachments
		};
		const msgToAdministration = {
			to: 'ewoudverbakel@gmail.com',
			from: 'no-reply@tennisclub7.nl',
			fromname: 'Ledenadministratie Tennisclub7',
			templateId: 'd-08a21deec3c9430ab552406395ed0c61',
			dynamic_template_data: dynamicData,
			attachments: attachments
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
