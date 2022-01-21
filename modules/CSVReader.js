module.exports = class CSVReader{
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