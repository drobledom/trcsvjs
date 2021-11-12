var trcsvjs = require("../src/trcsvjs");

var simpleCsv = require("fs").readFileSync("./test/csv_1.csv", "utf-8");

trcsvjs.csvStringToJs(simpleCsv, function (err, trcsv) {
  //console.log(trcsv.getRow(2));

  var spec = { a: "", b: "dz", c: "fz", d: "dt", e: "b", f: "sc", g: "ccy" };

  //Upload
  const csvAsJson = [];
  for (var i = 1; i <= trcsv.number_of_rows; i++) {
    //console.log(trcsv.getRow(i));
    var obj = trcsv.getObjFromRow(i, spec);
    //console.log(trcsv.getRowFromObj(obj, spec));

    csvAsJson.push(obj);
  }
  //console.log(csvAsJson);

  //Download
  const csv = trcsvjs.getEmptyCsv({ delimiter: ";" });
  csvAsJson.forEach((thisdata) => {
    csv.insertRowFromObj(thisdata, spec);
  });
  //console.log(csv);

  /*

	var csv = trcsvjs.getEmptyCsv('|','');
	csv.insertRow([1,2]);
	csv.insertRowInPos([3,4],5);


	console.log(csv.getCsvText());

	console.log(csv.getCell(5,2));
	csv.setCell(8,4,32);
	csv.setCell(5,2,5);
	console.log(csv.getCell(5,2));

	console.log(csv.getCsvText());*/
});
