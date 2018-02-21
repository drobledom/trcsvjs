/*!
	TRCSVJS
	v1.0.0
	https://github.com/drobledom/trcsvjs
	License: MIT
*/

//papa
if (typeof Papa === 'undefined'){
	var Papa = require('papaparse');
}

(function(root, Papa, factory)
{
	if (typeof define === 'function' && define.amd)
	{
		// AMD. Register as an anonymous module.
		define([], factory);
	}
	else if (typeof module === 'object' && typeof exports !== 'undefined')
	{
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory(Papa,true);
	}
	else
	{
		// Browser globals (root is window)
		root.Trcsvjs = factory(Papa,false);
	}
}(this, Papa, function(Papa,isNode)
{
	'use strict';

	var global = (function () {
		// alternative method, similar to `Function('return this')()`
		// but without using `eval` (which is disabled when
		// using Content Security Policy).

		if (typeof self !== 'undefined') { return self; }
		if (typeof window !== 'undefined') { return window; }
		if (typeof global !== 'undefined') { return global; }

		// When running tests none of the above have been defined
		return {};
	})();

	//Trestcjs library
	var T = {};

	//Map of function to ext
	T.csvStringToJs = csvStringToJs;
	T.getEmptyCsv = getEmptyCsv;
	T.getCsvFromFile = getCsvFromFile;
	T.getCsvFromUrl = getCsvFromUrl;


	/**
	 * This function convert string to Js using Papaparser. Next
	 * creates and return a trcsv object 
	 */
	function csvStringToJs(csvString,config,callback){
		if (typeof callback == 'undefined'){
			callback = config;
			config = {};
		}
		config = config || {}

		config.delimiter = typeof config.delimiter!=='undefined'?config.delimiter:';';
		config.encoding = typeof config.encoding!=='undefined'?config.encoding:"ISO-8859-1";

		config.complete = function(results,file){
			if (results.errors.length>0){
				return callback(results.errors);
			}
			var conf = {
				delimiter : results.meta.delimiter,
				newline    : results.meta.linebreak,
			}

			if (config.encoding == 'ISO-8859-1'){
				var iLen = results.data.length;
				for(var i=0; i<iLen;i++){
					var jLen = results.data[i].length;
					for(var j=0; j<jLen;j++){
						results.data[i][j] = results.data[i][j].toString('utf-8');
					}
				}
			}

			var newcsv = new C(conf);
			newcsv.initCsvFromArray(results.data);
			callback(null,newcsv);
		}
		Papa.parse(csvString,config)
	}


	/**
	 * This function create and return an empty trcsv object 
	 */
	function getEmptyCsv (config){
		var newcsv = new C(config);
		return newcsv;
	}

	/**
	 * This function convert file content to Js using Papaparser. Next
	 * creates and return a trcsv object 
	 */
	function getCsvFromFile(file,config,callback){
		csvStringToJs(file,config,callback);
	}

	/**
	 * This function convert file from url content to Js using Papaparser. Next
	 * creates and return a trcsv object 
	 */	
	function getCsvFromUrl(file,config,callback){
		if (typeof callback == 'undefined'){
			callback = config;
			config = {};
		}
		config = config || {}
		config.download = true;

		csvStringToJs(file,config,callback);
	}

	/**
	 * #######################################################
	 * ################# THE CSV OBJECT ######################
	 * #######################################################
	 */	
	var C = function(config){
		config = config || {}
		this.delimiter = typeof config.delimiter!=='undefined'?config.delimiter:';';
		this.newline = typeof config.newline!=='undefined' && config.newline != ''?config.newline:'\r\n';
		this._csv = [];
		this.number_of_rows = 0;
		this.objspec = {};
		this.emptyspec = '';
	}

	/**
	 * Init csv data 
	 */
	C.prototype.initCsvFromArray = function(obj){
		this._csv = obj;
		this.number_of_rows = obj.length;
	};

	/**
	 * return array with row N.
	 * From 1 to number_of_rows 
	 */
	C.prototype.getRow = function(n,emptyspec){
		if (n>this.number_of_rows || n<=0){
			return emptyspec;
		}
		return this._csv[n-1]
	};

	/**
	 * return array with row N and col C
	 * From 1 to number_of_rows 
	 */
	C.prototype.getCell = function(n, c, emptyspec){
		if (n>this.number_of_rows || n<=0 || c>this._csv[n-1].length || c<=0){
			return emptyspec;
		}
		return this._csv[n-1][c-1];
	};	

    /**
     * This function return an object with objectspec from row. Accept
     * subfields. From 1 to number_of_rows
     */
	C.prototype.getObjFromRow = function(n,objspec,emptyspec){
		if (n>this.number_of_rows || n<=0){
			return {};
		}
		if (typeof objspec === 'undefined'){
			objspec = this.objspec;
		}
		if (typeof emptyspec === 'undefined'){
			emptyspec = this.emptyspec;
		}
		var row = this.getRow(n);
		var obj = {};
		_recursiveRowToObj(row,0,obj,objspec,row.length);
		return obj;
	};

	/**
	 * This function convert ob in row array using specs
	 */
	C.prototype.getRowFromObj = function(obj,objspec,emptyspec){
		if (typeof objspec === 'undefined'){
			objspec = this.objspec;
		}
		if (typeof emptyspec === 'undefined'){
			emptyspec = this.emptyspec;
		}
		var row = [];
		_recursiveObjToRow(row,obj,objspec,emptyspec);
		return row;
	}

	/**
	 * Insert a row at the end of csv
	 */
	C.prototype.insertRow = function(row){
		this._csv.push(row);
		this.number_of_rows++;
	}

	/**
	 * Insert a row in an specific position. If position
	 * doesn't exists (csv smaller than position required) function will create empty rows until
	 * position is in array.
	 */
	C.prototype.insertRowInPos = function(row,pos){
		if (pos<=this.number_of_rows){
			this._csv[pos-1] = row;
		} else {
			while(pos>this.number_of_rows){
				this.insertRow([]);
			}
			this._csv[pos-1] = row;
		}
	}	

	/**
	 * Set value of cell in row N and col C
	 * From 1 to number_of_rows 
	 */
	C.prototype.setCell = function(n, c, value, emptyspec){
		if (n<=0 || c<=0){
			return;
		}
		while(n>this.number_of_rows){
			this.insertRow([]);
		}
		var row = this.getRow(n);
		while(c>row.length){
			row.push([]);
		}
		row[c-1] = value;
		this.insertRowInPos(row,n);
	};	

	/**
	 * Convert an object in a row array and insert it at the end of csv
	 */
	C.prototype.insertRowFromObj = function(obj,objspec,emptyspec){
		this._csv.push(this.getRowFromObj(obj,objspec,emptyspec));
		this.number_of_rows++;
	}

	/**
	 * Convert an object in a row array and insert it in an specific position. If position
	 * doesn't exists (csv smaller than position required) function will create empty rows until
	 * position is in array.
	 */
	C.prototype.insertRowInPosFromObj = function(obj,pos,objspec,emptyspec){
		if (pos<=this.number_of_rows){
			this._csv[pos-1] = this.getRowFromObj(obj,objspec,emptyspec);
		} else {
			while(pos>this.number_of_rows){
				this.insertRow([]);
			}
			this._csv[pos-1] = this.getRowFromObj(obj,objspec,emptyspec);
		}
	}	

	/**
	 * Return actual csv content as string text using unparse of papaparse
	 */
	C.prototype.getCsvText = function(config){
		config = config || {};
		if (typeof config.delimiter === 'undefined'){
			config.delimiter = this.delimiter;
		}
		if (typeof config.newline === 'undefined' || config.newline==''){
			config.newline = this.newline;
		}
		//config.encoding = "ISO-8859-1";

		return Papa.unparse(this._csv,config);
	}

	var CONST_MAX_CHAR = 256*256;
	function encodeUTF16LE(str) {
	    var out, i, len, c;
	    var char2, char3;

	    out = "";
	    len = str.length;
	    i = 0;
	    while(i < len) {
	        c = str.charCodeAt(i++);
	        var s = str[i-1];
	        var p=0;
	        var a = str.charAt(i-1);

	        if (c<CONST_MAX_CHAR){
	        	//Cuando despleguemos en china o mundo arabe esto no valdrá :)
	        	out += str.charAt(i-1);
	        }
	    }


	    var byteArray = new Uint8Array(out.length * 2);
	    for (var i = 0; i < out.length; i++) {
	    	var c = out.charCodeAt(i);
	    	var s = out.charAt(i);
	        byteArray[i*2] = out.charCodeAt(i); // & 0xff;
	        byteArray[i*2+1] = out.charCodeAt(i) >> 8; // & 0xff;
	    }

	    return byteArray;
	}


	/**
     * Get actual csv content, creates a local file directly in browser and download it.
     */
    C.prototype.browseCsv = function(filename,config){
    	if (isNode){
    		return '';
    	}
        var text = this.getCsvText(config);
		var textBin = encodeUTF16LE(text);
		//process.exit(0);
        var objectURL = createObjectURL(new Blob([textBin], {type: "data:text/csv;charset=UTF-16LE"}))

        var element = document.createElement('a');
        element.setAttribute('href', objectURL);
        element.setAttribute('download', filename+'.csv');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);
    }

	/**
     * createObjectURL wrapper
     */
    function createObjectURL(object) {
        return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
    }


	/**
     * Recursive function that converts row array in object
     */
	function _recursiveRowToObj(row,r,obj,objspec,rowlen){
		for(var f in objspec){
			if (r>rowlen){
				break;
			}
			var valSpec = objspec[f];
			if (typeof valSpec === 'object'){
				obj[f] = {};
				r = _recursiveRowToObj(row,r,obj[f],valSpec,rowlen);
			} else {
				obj[f] = _decodCellToVal(row[r],valSpec);
				r++;
			}
			
		}
		return r;
	};

	/**
     * Recursive function that converts object in row array
     */
	function _recursiveObjToRow(row,obj,objspec){
		for(var f in objspec){
			var valSpec = objspec[f];
			if (typeof valSpec === 'object'){
				if (typeof obj[f] == 'undefined'){
					obj[f] = {};
				}
				_recursiveObjToRow(row,obj[f],valSpec)
			} else {
				if (typeof obj[f] == 'undefined'){
					row.push('');
				} else {
					row.push(_decodValToCell(obj[f],valSpec))
				}
			}
		}
	}

	/**
	 * Convert cell value from csv to object value
	 */
	function _decodCellToVal(cell,valSpec){
        var omitEmpty = ['dz','fz','sc','bz'];
        if (cell == '' && omitEmpty.indexOf(valSpec)<0){
            return cell;
        }		
		switch(valSpec){
			//Currency Int 
			case 'ccy':
                return _toCInt(cell);
                break;

			//Decimal
            case 'd':
            case 'dz':
                return parseInt(cell);
                break;

            //Float
            case 'f':
            case 'fz':
                return parseFloat(cell.replace(',','.'));
                break;

            //Boolean
            case 'b':
            	return cell=='1'?true:false;
                break;

            //array comma separated
            case 'sc':
                cell = cell.split(',');
                for(var i=0;i<cell.length;i++){
                	cell[i] = cell[i].trim();
                	if (cell[i] == ''){
                		cell.splice(i,1);i--;
                	}
                }
                return cell;
                break;

            //date controller to Y-m-d
            case 'dt':
                var date = cell.trim();
                if(date.indexOf('/')>=0){
                	date = date.split('/');
                	date = date[2]+"-"+date[1]+"-"+date[0];
                }
                return date;
                break;

			default:
				return cell.trim();
				break;
		}
	}

	/**
	 * Val from object convert to cell to add to csv
	 */
	function _decodValToCell(val,valSpec){
        var omitEmpty = ['dz','fz','sc','bz'];
        if (val == '' && omitEmpty.indexOf(valSpec)<0){
            return val;
        }		
		switch(valSpec){
			//Currency Int 
			case 'ccy':
                return _toCFloat(val);
                break;

			//Decimal
            case 'd':
            case 'dz':
                return parseInt(val).toString();
                break;

            //Float
            case 'f':
            case 'fz':
                return val.toString().replace('.',',');
                break;

            //Boolean
            case 'b':
            case 'bz':
            	return val?'1':'0';
                break;

            //array comma separated
            case 'sc':
            	if (typeof val !== 'object'){
            		return [];
            	}
                for(var i=0;i<val.length;i++){
                	val[i] = val[i].trim();
                	if (val[i] == ''){
                		val.splice(i,1);i--;
                	}
                }
                return val.join(',');
                break;

            //date controller to Y-m-d
            case 'dt':
                //St Date type Y-m-d
                //We add spaces bouth sides to avoid excel convert date in other format...
                return " "+val+" ";

			default:
				return val.trim();
				break;
		}
	}

	/**
	 * convert currency integer into a float
	 */
	function _toCFloat(val)
    {	
    	val = (parseInt(val)/100).toString().replace('.',',');
        return val;
    }

    /**
     *  Convert a float number in currency integer
     */
    function _toCInt(val)
    {
    	val = Math.round(parseFloat(val.replace(',','.'))*100);
        return val;
    }


	return T;
}));

/*
			PAPAPARSE CONFIGURATION OBJECTS
{
	delimiter: "",	// auto-detect
	newline: "",	// auto-detect
	quoteChar: '"',
	header: false,
	dynamicTyping: false,
	preview: 0,
	encoding: "",
	worker: false,
	comments: false,
	step: undefined,
	complete: undefined,
	error: undefined,
	download: false,
	skipEmptyLines: false,
	chunk: undefined,
	fastMode: undefined,
	beforeFirstChunk: undefined,
	withCredentials: undefined
}


{
	quotes: false,
	quoteChar: '"',
	delimiter: ",",
	header: true,
	newline: "\r\n"
}
*/