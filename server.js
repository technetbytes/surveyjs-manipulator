require('dotenv').config();

function identifyQuestionsFromJson(radioGroupQuestions, imagePickerQuestions, 
									radioHashMap, imagePickerHashMap, imageEmptyAttributes, 
									answerObject){
	if(answerObject.answers){
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

function destructuredValueObject(value){
	if(value.text === '' && value.value === '')
	{
		return true;
	}
	return false;
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
		//console.log("++++");
		questionPartitionValues=[];
    });
	//console.log(radioEmptyAttributesMap);
}

function removeAttributesFromDocument(mongoDoc, imageEmptyAttributes, radioEmptyAttributes){
	
	//console.log(imageEmptyAttributes, radioEmptyAttributes);
	//console.log(Object.keys(mongoDoc.answers).length);
	
	//Part 1 :-
	imageEmptyAttributes.forEach((obj, comparingKey)=>{
		mongoDoc.answers.forEach((object,objectIndex) => {
			Object.entries(object).forEach(([internalKey, selectedValue]) => {
				if(comparingKey  === internalKey){
					console.log("<------ compare --->",comparingKey,internalKey,objectIndex);
					mongoDoc.answers.splice(objectIndex,1);
					return;
				}				
			})			
		});		
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
	
	//make a list of empty radio elements name 
	//
	// no need for the following code
	//
	// emptyRadioItems = []
	// Object.values(radioEmptyAttributes).forEach((obj, index)=>{	
		// if (!emptyRadioItems.includes(obj.key)) {
			// emptyRadioItems.push(obj.key);
		// }		
	// });
	
	// //Remove attributes from json document based on finding question name
	//
	//
	// Change the following logic because we removing items on Answer array object and loop is running on the object :)
	//
	//
	// mongoDoc.answers.forEach((obj,objectIndex) => {
		// Object.entries(obj).forEach(([key, selectedValue]) => {
			// //console.log(key,objectIndex);
			// if(imageEmptyAttributes.has(key)){
				// // find item in Map object
				// mongoDoc.answers.splice(objectIndex,1)
			 // }
			// // else if (emptyRadioItems.includes(key)){
				// // // find item in newly radio elements list object				
				// // mongoDoc.answers.splice(objectIndex,1)
			// // }
			// else if (radioEmptyAttributes.has(key)){
				// // find item in newly radio elements list object				
				// //console.log(radioEmptyAttributes.get(key));
				// console.log(objectIndex, key, selectedValue.value);
				// console.log("-----");
				// let dataValues = radioEmptyAttributes.get(key);
				// dataValues.forEach((emptyElement,index2) => {
					// console.log(emptyElement.value.value, objectIndex);
					// if(emptyElement.value.value == selectedValue.value){
						// mongoDoc.answers.splice(objectIndex,1)
					// }
				// });
				// //console.log(value);
			// }			
		// });
	// });	
	console.log(Object.keys(mongoDoc.answers).length);
}

class MongoDB{
	constructor(dbfile){
		this.dbfile = dbfile;
		this.mongoose = null;
		this.Schema = null;
		this.simpleSurveyResponsesMongoSchema = null;
		this.simpleSurveyResponsesModel = null;
	}
	
	open(){
		const mongoose = require("mongoose");
		this.mongoose = mongoose;
		this.Schema = this.mongoose.Schema;
		
		this.mongoose.connect(this.dbfile, {
			useNewUrlParser: true,		
			useUnifiedTopology: true,
		  })
		  .then(() => {
			console.log("Connected to MongoDB");
		  })
		  .catch((err) => console.error("couldnt connect....", err));
		  
		this.simpleSurveyResponsesMongoSchema = new this.Schema(
			  {
				metaKey: {
				  type: Object,
				},
			  },
			  { strict: false }
			);
		this.simpleSurveyResponsesModel = mongoose.model(
			"simplesurveyresponses",
			this.simpleSurveyResponsesMongoSchema
		);
	}
	
	getRecordByResponseCode(responseCode) {
		return new Promise((resolve, reject) => {
		  this.simpleSurveyResponsesModel.find({'metaKey.projectId':7, 'metaKey.simpleSurveyResponseCode':responseCode}, (err, rows) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  reject(err)
			} else {
			  resolve(rows)
			}
		  }).limit(1)
		})
	}
	
	getOneRecord() {
		return new Promise((resolve, reject) => {
		  this.simpleSurveyResponsesModel.find({'metaKey.projectId':7}, (err, rows) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  reject(err)
			} else {
			  resolve(rows)
			}
		  }).limit(1)
		})
	}
}

class CSVReader{
	constructor(csvfile){
		this.csvfile = csvfile;		
	}	
	
	read()
	{
		const fs = require('fs');
		const csvParse = require("papaparse");		
		const content = fs.readFileSync(this.csvfile, "utf8");		
		var rows;
		csvParse.parse(content, {
			header: true,
			delimiter: ",",
			complete: function(results) {
				rows = results.data;
			}
		});
		return rows;
	}
}

class SqliteDB {
	constructor(dbfile){
		this.dbfile = dbfile;
		this.db = null;
	}
	
	open(){
		const sqlite3 = require('sqlite3').verbose();
		// open the database
		this.db = new sqlite3.Database(this.dbfile, (err) => {
		  if (err) {
			console.error(err.message);
		  }
		  console.log('Connected to the chinook database.');
		});	
		return db;
	}

	createTables(){
		const projectResponseIds = `
		CREATE TABLE IF NOT EXISTS projectresponseidsinfo (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  responsecode TEXT,
		  status INTEGER)`
		this.db.run(projectResponseIds);
		
		
		const lastProcessResponseCode = `
		CREATE TABLE IF NOT EXISTS lastresponsecode (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  projectresponseinfo_id INTEGER)`
		this.db.run(lastProcessResponseCode);
		
		const processedJsonObject = `
		CREATE TABLE IF NOT EXISTS processedjsonobject (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  processanswerjson TEXT,
		  responsecode TEXT,
		  projectresponseinfo_id INTEGER)`
		this.db.run(processedJsonObject);
		
		console.log("Tables created in the database");
	}
	
	insertProjectResponseIdsData(jsonData){
		jsonData.forEach(row => {
			this.db.run('INSERT INTO projectresponseidsinfo (responsecode, status) VALUES (?,?)',[row['responsecode'],row['status']])
		});
	}
	
	insertProcessResponse(projectdata_id){
		this.db.run('INSERT INTO lastresponsecode (projectresponseinfo_id) VALUES (?)',[projectdata_id]);
	}
	
	insertProcessedJson(responseCode, projectResponseId, jsonObject) {
		this.db.run('INSERT INTO processedjsonobject (responsecode,projectresponseinfo_id,processanswerjson) VALUES (?,?,?)',[responseCode, projectResponseId, jsonObject]);
	}
	
	queryTable(){
		const sql = 'SELECT * FROM projectdata'
		this.db.all(sql,[], (err, result) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  (err)
			} else {
			  console.log(result)
			}
		  });	
	}	

	getLastRecord() {
		return new Promise((resolve, reject) => {
		  this.db.get("SELECT projectresponseinfo_id FROM lastresponsecode ORDER BY projectresponseinfo_id DESC LIMIT 1", [], (err, rows) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  reject(err)
			} else {
			  resolve(rows)
			}
		  })
		})
	}
	
	get(sql, params = []) {
		return new Promise((resolve, reject) => {
		  this.db.get(sql, params, (err, rows) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  reject(err)
			} else {
			  resolve(rows)
			}
		  })
		})
	}
	
	all(sql, params = []) {
		return new Promise((resolve, reject) => {
		  this.db.all(sql, params, (err, rows) => {
			if (err) {
			  console.log('Error running sql: ' + sql)
			  console.log(err)
			  reject(err)
			} else {
			  resolve(rows)
			}
		  })
		})
	}

	close(){
		this.db.close((err) => {
		if (err) {
			console.error(err.message);
		  }
		  console.log('Close the database connection.');
		});
	}
}

async function setupDBandLogs(){
	//Open Sqlite Database 
	db = new SqliteDB(process.env.SQLITE3_CONNECTION);
	db.open();
	//
	//Setup Database and tables, following need to run only one time.
	//
		//Step 1. Read ResponseId data from csv file
		csv = new CSVReader(process.env.CSV_FILE);
		csvJsonData = csv.read();
	
		//Step 2. Create tables in database;
		db.createTables();
	
		//Step 3. Insert data in sqlite
		db.insertProjectResponseIdsData(csvJsonData);

		//Step 4. Close DB connection
		db.close();
	//*************************************************
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

	//Single & Multiple Map
	const radioHashMap = new Map();
	const radioEmptyAttributesMap = new Map();
	const imagePickerHashMap = new Map();
	const imageEmptyAttributesMap = new Map();
	
	//Open Sqlite Database 
	db = new SqliteDB(process.env.SQLITE3_CONNECTION);
	db.open();	
	
	//connect to MongoDB
	mongodb = new MongoDB(process.env.MONGODB_CONNECTION);
	mongodb.open();
	
	let pkId = 0;
	while(isRecordFind){		
		console.log("Getting last processed response code from sqlite ...");
		const lastProcessedResponseCode = await db.getLastRecord();
		if(typeof lastProcessedResponseCode == 'undefined'){
			console.log("Program fetching data first time ...");
			let sqlQuery = 'SELECT responsecode FROM projectresponseidsinfo WHERE Id  = ?'
		    pkId = 1;
			const getResponseCode = await db.get(sqlQuery,pkId);
			if(typeof getResponseCode == 'undefined'){
				//Its means projectresponseidsinfo table is empty
				console.log("projectresponseidsinfo data empty, stopping program ...");
				isRecordFind = false;
			}
			else{
				//Fetching data from MongoDB for processing
				const mongoDocument = await mongodb.getRecordByResponseCode('95863229071520');//getResponseCode.responsecode);
				//Start processing MongoDB json Document and identify questions
				identifyQuestionsFromJson(	singleSelectionQuestions, multiSelectionQuestions, 
											radioHashMap, imagePickerHashMap, imageEmptyAttributesMap, 
											mongoDocument?.[0]);
				
				//Printing Map Data Structure
				//console.log("Map Data Structure ------------------");
				//console.log(radioHashMap);
				//console.log("Map Data Structure ------------------");
				//console.log(imagePickerHashMap);
				
				//identify Radio Button elements
				radioQuestionProcessing(radioHashMap, radioEmptyAttributesMap);
				//identify multi-selection elements
				imagePickerQuestionProcessing(imagePickerHashMap, imageEmptyAttributesMap);
				
				//Print object elements 
				//console.log(imageEmptyAttributesMap);
				//console.log(radioEmptyAttributesMap);
				
				removeAttributesFromDocument((mongoDocument?.[0]), imageEmptyAttributesMap, radioEmptyAttributesMap);
				//console.log(JSON.stringify(mongoDocument?.[0]));
				db.insertProcessedJson(1,1,JSON.stringify(mongoDocument?.[0]));
				isRecordFind = false;
			}
		}
		else{

			isRecordFind = false;
		}
	}
	
	
	
	
    //response = await db.all("SELECT projectresponseinfo_id FROM lastresponsecode ORDER BY projectresponseinfo_id DESC LIMIT 1", []);
	//console.log("ProjectData Id:", response[0].projectresponseinfo_id)
	
	//connect to MongoDB
	//mongodb = new MongoDB("mongodb+srv://admin:admin@cluster0.5inoe.mongodb.net/simplesurveyresponses");
	//mongodb.open();
	
	//for testing purpose only, remove the following in the production
	//const result = await mongodb.getRecordByResponseCode('58836213475');
	
	//Process MongoDB json Document and identify questions
	//identifyQuestionsFromJson(radioGroupQuestions, imagePickerQuestions, radioHashMap, imagePickerHashMap, imageEmptyAttributes, radioEmptyAttributes, result?.[0]);
	
	//Print Map Data Structure
	//console.log("------------------");
	// console.log(radioHashMap);
	// console.log("------------------");
	// console.log(imagePickerHashMap);
	
	
	//identify Radio Button elements
	//radioQuestionProcessing(radioHashMap, radioEmptyAttributes);
	//identify multi-selection elements
	//imagePickerQuestionProcessing(imagePickerHashMap, imageEmptyAttributes);
	
	//Print object elements 
	// console.log(imageEmptyAttributes);
	// console.log(radioEmptyAttributes);

	//test(radioGroupQuestions);
	//db.insertProcessedJson(1,1,result?.[0]);
	
	
	
	//Close sqlite database
	db.close();
}

//Step 1:- One-time only, Setup Database and Update Load Record CSV. 
//setupDBandLogs()

//Step 2:- Call application Main function
mainApp()