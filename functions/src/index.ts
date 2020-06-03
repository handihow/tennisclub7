import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

import axios from 'axios';

const sgMail = require('@sendgrid/mail');
const dateFormat = require('dateformat');
const db = admin.firestore();
const Excel = require('exceljs');

const adminEmailAddress = 'ledenadministratie@tennisclub7.nl'
// const adminEmailAddress = 'roeland@handihow.com';

export const sendEmails = functions.firestore.document('registrations/{id}').onWrite(async (change, context) => {
	const newValue = change.after.data();
	const previousValue = change.before.data();
	if(newValue && previousValue && newValue.isFinished && !previousValue.isFinished){
		//set the api key for sendgrid
		sgMail.setApiKey(functions.config().sendgrid.key);
		const data = newValue.data;
		const attachmentsToMember = [];
		const attachmentsToAdministration = []
		try{
			const image = data.image[0];
			if(image && image.content){
				const imageBase64 = await getImageAsBuffer(image.content);
				const imageAttachment = {
			      content: imageBase64,
			      filename: image.name,
			      type: image.type,
			      disposition: "attachment"
			    };
				attachmentsToMember.push(imageAttachment);
				attachmentsToAdministration.push(imageAttachment);
			}
			const signature : string = data.signature;
			const signatureBase64 = signature.split(',')[1];
			const signatureFileType = signature.split(',')[0].split(';')[0].split(':')[1];
			const signatureFileName = data.firstName + '_' + data.lastName + '_' + 'handtekening.png'
			const signatureAttachment = {
		    	content: signatureBase64,
		    	filename: signatureFileName,
		    	type: signatureFileType,
		    	disposition: "attachment"
		    };
		    attachmentsToMember.push(signatureAttachment);
		    attachmentsToAdministration.push(signatureAttachment);
			const excelBuffer = await createExcel();
			if(Buffer.isBuffer(excelBuffer)){
				const base64File = excelBuffer.toString('base64');
				attachmentsToAdministration.push({
					content: base64File,
					filename: 'Overzicht alle inschrijvingen.xlsx',
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					disposition: "attachment"
				})
			}
		} catch(e){
			console.error(e.toString());
		}		
		const dynamicData = {
			  email: safeTextTransform(data.email),
	          firstName: safeTextTransform(data.firstName),
	          lastName: safeTextTransform(data.lastName),
	          gender: safeTextTransform(data.gender),
	          birthDate: safeDateTransform(data.birthDate),
	          address: safeTextTransform(data.address),
	          postalCode: safeTextTransform(data.postalCode),
	          city: safeTextTransform(data.city),
	          mobilePhoneNumber: safeTextTransform(data.mobilePhoneNumber),
	          membershipType: safeTextTransform(data.membershipType),
	          date: safeDateTransform(data.date),
	          signedBy: safeTextTransform(data.signedBy),
	          placeSigned: safeTextTransform(data.placeSigned),
	          dateSigned: safeDateTransform(data.dateSigned),
	          currentRatingSingles: safeTextTransform(data.currentRatingSingles),
	          currentRatingDoubles: safeTextTransform(data.currentRatingDoubles),
	          teammembers: safeTextTransform(data.teammembers)
        };
		const msgToNewMember = {
			// to: data.email,
			to: data.email,
			from: 'no-reply@tennisclub7.nl',
			fromname: 'Ledenadministratie Tennisclub7',
			templateId: 'd-06de23332fd04c43a1258a1c99f090bb',
			dynamic_template_data: dynamicData,
			attachments: attachmentsToMember
		};
		const msgToAdministration = {
			to: adminEmailAddress,
			from: 'no-reply@tennisclub7.nl',
			fromname: 'Ledenadministratie Tennisclub7',
			templateId: 'd-08a21deec3c9430ab552406395ed0c61',
			dynamic_template_data: dynamicData,
			attachments: attachmentsToAdministration
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

const safeDateTransform = (date: string) : string => {
	let safeDateString = '';
	try {
		 safeDateString = dateFormat(date, "d-m-yyyy")
	} catch(e){
		safeDateString = date;
	}
	return safeDateString
}

const safeTextTransform = (text: string) : string => {
	let safeTextString = '-';
	if(text){
		safeTextString = text;
	}
	return safeTextString;
}

const createExcel = async () => {
	const registrationSnap = await db.collection('registrations').orderBy('updatedAt', 'asc').get();
	if(registrationSnap.empty){
		return null;
	} else {
		const workbook = new Excel.Workbook();
		workbook.creator = 'HandiHow';
		workbook.lastModifiedBy = 'NodeJS automatic function by HandiHow';
		workbook.created = new Date();
		const sheet = workbook.addWorksheet('Inschrijvingen');
		sheet.columns = [
		  { header: 'Email', key: 'email', width: 30 },
		  { header: 'Voornaam', key: 'firstName', width: 20 },
		  { header: 'Achternaam', key: 'lastName', width: 20 },
		  { header: 'Geslacht', key: 'gender', width: 10 },
		  { header: 'Geb. datum', key: 'birthDate', width: 10 },
		  { header: 'Adres', key: 'address', width: 20},
		  { header: 'Postcode', key: 'postalCode', width: 10},
		  { header: 'Plaatsnaam', key: 'city', width: 20},
		  { header: 'Mobiel', key: 'mobilePhoneNumber', width: 20},
		  { header: 'Lidmaatschap', key: 'membershipType', width: 30},
		  { header: 'Lid per', key: 'date', width: 10},
		  { header: 'Enkelspel', key: 'currentRatingSingles', width: 10},
		  { header: 'Dubbelspel', key: 'currentRatingDoubles', width: 10},
		  { header: 'Pasfoto', key: 'imageUrl', width: 20},
		  { header: 'Teamleden', key: 'teammembers', width: 50}
		];
		const registrationRecords = registrationSnap.docs.map(d => d.data());
		registrationRecords.forEach(record => {
			const data = record.data;
			if(data.isFinished){
				sheet.addRow({
				  email: safeTextTransform(data.email),
		          firstName: safeTextTransform(data.firstName),
		          lastName: safeTextTransform(data.lastName),
		          gender: safeTextTransform(data.gender),
		          birthDate: safeDateTransform(data.birthDate),
		          address: safeTextTransform(data.address),
		          postalCode: safeTextTransform(data.postalCode),
		          city: safeTextTransform(data.city),
		          mobilePhoneNumber: safeTextTransform(data.mobilePhoneNumber),
		          membershipType: safeTextTransform(data.membershipType),
		          date: safeDateTransform(data.date),
		          currentRatingSingles: safeTextTransform(data.currentRatingSingles),
		          currentRatingDoubles: safeTextTransform(data.currentRatingDoubles),
		          imageUrl: data.image && data.image[0] && data.image[0].content ? 
		          	{
					  text: 'link naar pasfoto',
					  hyperlink: data.image[0].content,
					  tooltip: 'link naar pasfoto'
					} : '-',
				  teammembers: safeTextTransform(data.teammembers)
				});
			}
		});
		return workbook.xlsx.writeBuffer()
		.then((buffer: Buffer) => {
			return buffer;
		});
	}
}

const getImageAsBuffer = function(url: string) : Promise<string> {
	return new Promise((resolve, reject) => {
		axios.get(url, {responseType: 'arraybuffer'})
			.then(response => {
		        const imageBuffer : Buffer = Buffer.from(response.data);
		        const base64EncodedBuffer : string = imageBuffer.toString('base64');
		        resolve(base64EncodedBuffer);
			})
			.catch(err => {
				reject(null);
			});
	});
}


