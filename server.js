require('dotenv').config();
let mongoDB = require("./modules/MongoDB.js");
let sqlite3DB = require("./modules/Sqlite3.js");
let csvReader = require("./modules/CSVReader.js");


function identifyQuestionsFromJson(radioGroupQuestions, imagePickerQuestions, 
									radioHashMap, imagePickerHashMap, imageEmptyAttributes, 
									answerObject){									
	if(typeof(answerObject)  !== undefined){
		if(typeof(answerObject.answers)  !== undefined){
			//console.log(answerObject.answers);
			answerObject.answers.forEach(obj => {
				//console.log(obj);
				Object.entries(obj).forEach(([key, value]) => {
					if(radioGroupQuestions.includes(key))
					{
						if(!radioHashMap.has(key))
						{ 
							let listOfRadioGroupQuestion = [value];
							radioHashMap.set(key, listOfRadioGroupQuestion);
						}
						else{
							let listOfRadioGroupQuestion = radioHashMap.get(key);
							listOfRadioGroupQuestion.push(value);
						}
						//console.log(`${key} ${value} ====> Radio Type`);
					}
					else{
						const position = key.indexOf("_");				
						if(position > -1){
							const newQuestionPart = key.substring(0,position);		
							if(imagePickerQuestions.includes(newQuestionPart))
							{
								if(destructuredValueObject(value) == false)
								{
									if(!imagePickerHashMap.has(key))
									{ 
										let imagePicQuestion = [value];
										imagePickerHashMap.set(key, imagePicQuestion);
									}
									else{
										let imagePicQuestion = imagePickerHashMap.get(key);
										imagePicQuestion.push(value);
									}						
									//console.log(`${key} ${value} ====> Image Picker Type`);
								}
								else{
									if(!imageEmptyAttributes.has(key))
									{ 
										let imagePicQuestion = [value];
										imageEmptyAttributes.set(key, imagePicQuestion);
									}
									else{
										let imagePicQuestion = imageEmptyAttributes.get(key);
										imagePicQuestion.push(value);
									}
								}
							}
						}
					}            
				});       
			});
		}
	}
}

function destructuredValueObject(value){
	if(value.text === '' && value.value === '')
	{
		return true;
	}
	return false;
}

function renameKey ( obj, oldKey, newKey ) {
	obj[newKey] = obj[oldKey];
	delete obj[oldKey];
}

function imagePickerQuestionProcessing(imagePickerHashMap, imageEmptyAttributes){
	let questionPartition = [];
	let questionPartitionValues = [];	
	//Make Unique question Partition Names
	imagePickerHashMap.forEach((values,keys)=>{
      //console.log(values,keys)	  
	  const position = keys.indexOf("_");	
	  if(position > -1){
		newQuestionPart = keys.substring(0,position);
		if(!questionPartition.includes(newQuestionPart))
		{
			questionPartition.push(newQuestionPart);
		}
	  }
    });		
	//console.log(questionPartition);	
	questionPartition.forEach(qstPartition => {
		//console.log(qstPartition);		
		imagePickerHashMap.forEach((values,keys)=>{
			const position = keys.indexOf("_");	
			matchingQuestionPartName = keys.substring(0,position);
			if(matchingQuestionPartName == qstPartition)
			{
				data = { key : keys, value : values }				
				questionPartitionValues.push(data);
			}
		});		
		let maxExeculdeValue = Math.max.apply(Math, questionPartitionValues.map(function(o) { return o.value[0].value; }));
		//console.log(maxExeculdeValue);
		//console.log(imageEmptyAttributes);
		questionPartitionValues.forEach(qstPart => {
			if(qstPart.value[0].value != maxExeculdeValue.toString())
			{	
				imageEmptyAttributes.set(qstPart.key, qstPart.value);
			}
		});		
		//console.log(imageEmptyAttributes);
		questionPartitionValues=[];
	});

}

function radioQuestionProcessing(radioHashMap, radioEmptyAttributesMap){
	//console.log(" ======== ", radioHashMap);
	let radioPartitionValues = [];	
	let questionPartitionValues = [];
	
	//Make Unique question Partition Names
	radioHashMap.forEach((values,keys)=>{
      //console.log(values,keys);
	  //console.log(Object.entries(values));
	  let radioButtonOptions = Object.entries(values);
	  //console.log("RadioOptions");
	  //console.log(radioButtonOptions);	  
	  radioButtonOptions.forEach(item => {		
		//console.log("Radio item each");
		//console.log(item[1]);
		data = { key : keys, value : item[1] };
		questionPartitionValues.push(data);
	  })
		//console.log(questionPartitionValues);
		let maxExeculdeValue = Math.max.apply(Math, questionPartitionValues.map(function(o) { return o.value.value; }));
		//console.log(maxExeculdeValue);
		//console.log(" ====MAX START ==== ");
		//console.log(questionPartitionValues);
		//console.log(" ====MAX END ==== ");

		// if(questionPartitionValues.length == 1){
		// 	questionPartitionValues.forEach(qstPart => {
		// 		data = { key : qstPart.key, value : qstPart.value };
		// 		if(!radioEmptyAttributesMap.has(qstPart.key)){
		// 			let valuesData = [data];
		// 			radioEmptyAttributesMap.set(qstPart.key, valuesData);
		// 		}
		// 	});
		// }
		// else
		{
			questionPartitionValues.forEach(qstPart => {		
				if(qstPart.value.value != maxExeculdeValue.toString()){	
					data = { key : qstPart.key, value : qstPart.value };	
					//console.log(data);
					if(!radioEmptyAttributesMap.has(qstPart.key)){ 
						let valuesData = [data];
						radioEmptyAttributesMap.set(qstPart.key, valuesData);
						//console.log(radioEmptyAttributesMap);
					}
					else{
						let valuesData = radioEmptyAttributesMap.get(qstPart.key);
						valuesData.push(data);
						//console.log("*****");
						//console.log(radioEmptyAttributesMap);
					}				 
				}
			});
		}
		//console.log("++++");
		questionPartitionValues=[];
    });
	//console.log(" *========* ", radioEmptyAttributesMap);
}

function removeAttributesFromDocument(mongoDoc, imageEmptyAttributes, radioEmptyAttributes){

	//Part 1 a :- In this Part A we are remove all attributes based on emptyAttributes items.
	imageEmptyAttributes.forEach((obj, comparingKey)=>{
		mongoDoc.answers.forEach((object,objectIndex) => {
			Object.entries(object).forEach(([internalKey, selectedValue]) => {
				if(comparingKey  === internalKey){					
					mongoDoc.answers.splice(objectIndex,1);
					return;
				}				
			})			
		});		
	})
	//Part 1 b :- In this Part B we are rename all attributes based on emptyAttributes items first part.
	renameColumnName = [];
	imageEmptyAttributes.forEach((obj, comparingKey)=>{
		const position = comparingKey.indexOf("_");				
		if(position > -1){
			const newQuestionPart = comparingKey.substring(0,position);	
			if(!renameColumnName.includes(newQuestionPart)){
				renameColumnName.push(newQuestionPart);
			}
		}
	})
	//console.log(" ---------------- rename Column name",renameColumnName);

	renameColumnName.forEach(colName => {		
		mongoDoc.answers.forEach((object,objectIndex) => {
			Object.entries(object).forEach(([internalKey, selectedValue]) => {
				const position = internalKey.indexOf("_");
				 if(position > -1){		
					newAttributeName = internalKey.substring(0,position);
					if(colName === internalKey.substring(0,position)){
						console.log(object);
						var newAttributeNameObj = {}
						newAttributeNameObj[newAttributeName] = selectedValue;
						//replace the attribute with the new object
						mongoDoc.answers.splice(objectIndex, 1, newAttributeNameObj);
				 		//console.log(" ---------------- column going to rename", newAttributeName, selectedValue, objectIndex);
						//console.log(" --- new object ",newAttributeNameObj);
				 	}
				 }
			})
		})
	})

	//Part 2 :- 
	radioEmptyAttributes.forEach((objectList, comparingKey)=>{
		//console.log("radio *****************************>",objectList,comparingKey);
		objectList.forEach((listObject, listIndex)=>{
			//console.log("List ******>",listObject, listIndex, comparingKey);
			//step 1 :- start looping mongoDoc.answers object and find the comparingKey element.
			//step 2 :- remember all indexs of the finding.			
			mongoDoc.answers.forEach((object,objectIndex) => {
				Object.entries(object).forEach(([internalKey, selectedValue]) => {
					if(comparingKey === internalKey){						
						if(selectedValue.value === listObject.value.value){
							//console.log("Keys ******>",comparingKey, internalKey, selectedValue.value, objectIndex, listObject.value.value);
							mongoDoc.answers.splice(objectIndex,1);
							return;
						}
					}
				});
			})				
		})
	})
	//console.log(Object.keys(mongoDoc.answers).length);
}

async function uploadLogs(){

	//Open Sqlite Database 
	db = new sqlite3DB(process.env.SQLITE3_CONNECTION);
	db.open();
	
	//Step 1. Read ResponseId data from csv file
	console.log("Reading CSV file from ",process.env.CSV_FILE);
	csv = new csvReader(process.env.CSV_FILE);
	csvJsonData = csv.read();

	//Step 2. Insert data in sqlite
	console.log("Inserting csv records in the table ...");
	db.insertProjectResponseIdsData(csvJsonData);

	//Step 3. Close DB connection
	db.close();
}

async function setupDB(){
	//Open Sqlite Database 
	db = new sqlite3DB(process.env.SQLITE3_CONNECTION);
	db.open();
	//
	//Setup Database and tables, following need to run only one time.
	//			
		//Step 1. Create tables in database;
		console.log("Creating Tables in database ...");
		db.createTables();

		//Step 2. Close DB connection
		db.close();
	//*************************************************
}

async function documentProcessing(pkId, singleSelectionQuestions, multiSelectionQuestions){
	//Single & Multiple Map
	const radioHashMap = new Map();
	const radioEmptyAttributesMap = new Map();
	const imagePickerHashMap = new Map();
	const imageEmptyAttributesMap = new Map();

	let isRecordFind = true;
	let sqlQuery = 'SELECT responsecode FROM projectresponseidsinfo WHERE Id  = ?'	
	const getResponseCode = await db.get(sqlQuery,pkId);
	if(typeof getResponseCode == 'undefined'){
		//Its means projectresponseidsinfo table is empty
		console.log("Project Responseids info data empty or end, stopping program ...");
		isRecordFind = false;
	}
	else{
		//Fetching data from MongoDB for processing
		console.log("Fetching Document Id :- ",getResponseCode.responsecode);
		const mongoDocument = await mongodb.getRecordByResponseCode(getResponseCode.responsecode);//'95863229071520');
		if(mongoDocument !== undefined && mongoDocument.length > 0){
			//Start processing MongoDB json Document and identify questions
			identifyQuestionsFromJson(	singleSelectionQuestions, multiSelectionQuestions, 
										radioHashMap, imagePickerHashMap, imageEmptyAttributesMap, 
										mongoDocument?.[0]);
			//identify Radio Button elements
			radioQuestionProcessing(radioHashMap, radioEmptyAttributesMap);
			//identify multi-selection elements
			imagePickerQuestionProcessing(imagePickerHashMap, imageEmptyAttributesMap);
			
			//Remove Elements from documents
			removeAttributesFromDocument((mongoDocument?.[0]), imageEmptyAttributesMap, radioEmptyAttributesMap);
			
			//Insert Processed JSON in the database
			db.insertProcessedJson(getResponseCode.responsecode, pkId, JSON.stringify(mongoDocument?.[0]));
			
			//Insert Processed Response Id for next iteration
			db.insertProcessResponse(pkId);
		}
		else{
			pkId = pkId++;
			db.insertProcessResponse(pkId);
		}
	}
	return isRecordFind;
}

async function mainApp() {
	
	//Info :- Important Point
	//*************************************************
	//As per our discuss we need to add support of String Data as well. Currently all data is in numeric form.
	//*************************************************

	//Question Name definition
	const singleSelectionQuestions = process.env.SINGLE_SELECTION_QUESTIONS;
	const multiSelectionQuestions = process.env.MULTI_SELECTION_QUESTIONS;

	//Execution Condition
	let isRecordFind = true;

	//Open Sqlite Database 
	db = new sqlite3DB(process.env.SQLITE3_CONNECTION);
	db.open();	
	
	//connect to MongoDB
	mongodb = new mongoDB(process.env.MONGODB_CONNECTION);
	mongodb.open();
	
	let pkId = 0;
	while(isRecordFind){		
		console.log("Getting last processed response code from sqlite ...");
		const lastProcessedResponseCode = await db.getLastRecord();
		if(typeof lastProcessedResponseCode == 'undefined'){
			console.log("Program fetching data first time ...");
			pkId = 1;			
			isRecordFind = await documentProcessing(pkId, singleSelectionQuestions, multiSelectionQuestions);
		}
		else{
			console.log("Program fetching data for next iteration ...");
			console.log(lastProcessedResponseCode.projectresponseinfo_id);
			pkId = lastProcessedResponseCode.projectresponseinfo_id + 1;
			isRecordFind = await documentProcessing(pkId, singleSelectionQuestions, multiSelectionQuestions);
		}
	}
	console.log("Database connection closing ...");
	//Close sqlite database
	db.close();
	
	console.log("Program ending ...");
	process.exit(0);
}

//Step 1:- One-time only, Setup Database. 
setupDB()

//Step 2:- Upload CSV records in the table.
uploadLogs();
 
//Step 3:- Call application Main function
mainApp()