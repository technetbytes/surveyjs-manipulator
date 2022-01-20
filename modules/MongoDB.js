module.exports = class MongoDB{
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