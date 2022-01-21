module.exports = class SqliteDB {
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
		  console.log('Connected to the record management database.');
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