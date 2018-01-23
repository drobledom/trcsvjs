# trcsvjs
A csv manager module for node and browser. This module wrapp papaparse library and add extra features.
See papaparse page for more information: https://www.npmjs.com/package/papaparse

## Include/Declare
Include in Browser
```js
    // ....
    <script type='text/javascript' src='PATH/TO/LIB/node_modules/papaparse/papaparse.min.js?'></script>
	<script type='text/javascript' src='PATH/TO/LIB/trcsvjs.min.js?'></script>
	// Trcsvjs available
	// ....
```
Declare in NodeJs
```js
    npm install trcsvjs
    //....
    var Trcsvjs = require('trcsvjs')
```

## Creating a csv object
Library Trcsvjs implement a list of functions that allow to create a csv object
```js
    // Create csv object from string CSV_STRING
    Trcsvjs.csvStringToJs(CSV_STRING[,config],callback) //callback(err,csv)
    
    // Create csv object from file getted from DOM
    Trcsvjs.getCsvFromFile(ELEMENT_FILE_FROM_DOM[,config],callback) //callback(err,csv)
    
    // Create csv object from csv in URL
    Trcsvjs.getCsvFromUrl(URL[,config],callback) //callback(err,csv)
    
    // Create empty csv object 
    var csv = Trcsvjs.getEmptyCsv([config])
````
#### Config
Config use same parameters than papaparse. See papaparse page for more information: https://www.npmjs.com/package/papaparse

## Usage of CSV object
After you create a csv object, you can manage it using its function. All reference to position for column and row start at 1..n
```js
    //Init csv using directly an array of array [[],[],[],[]] -> [ROW,ROW,ROW,..]
    csv.initCsvFromArray(array)
    
    //Return cell value in column "col" of row "pos"
    var value = csv.getCell(pos,col)
    
    //Return cell value in column "col" of row "pos"
    var value = csv.getCell(pos,col)
    
    //Set value of cell in column "col" of row "pos"
    csv.setCell(pos,col,value)
    
    //Return all csv converted in string
    var text = csv.getCsvText(config); //use papaparse, config of papaparse

    //Create a file in browser and force download (not in NodeJs)
    csv.browseCsv(filename,config) //use papaparse, config of papaparse

    //Return row (array[]) in position "pos"
    var row = csv.getRow(pos)
    
    //Return row converted in object from row in position "pos". To convert row in object use objspec
    var obj = csv.getObjFromRow(pos,objspec) 
    
    //Return row array convertirg an object into a row. To convert object in row use objspec
    var row = csv.getRowFromObj(pos,objspec)     
    
    //Insert row (array[]) at the end of file
    csv.insertRow(row)
    
    //Insert row (array[]) at position pos
    csv.insertRowInPos(row,pos)    
    
    //Insert row convertif first from object
    csv.insertRowFromObj(obj,objspec);
    csv.insertRowInPosFromObj(obj,pos,objspec);
```

## Object Spec
You can create easly an object from a row using an object spec. An object spec is like:
```js
{
    "name_field_1":CONF_FIELD,
    "name_field_2":CONF_FIELD,
}
```
If you have a row like ['foo','bar'] and convert in object using previous spec you receive an object:
```js
{
    "name_field_1" : 'foo',
    "name_field_2" : 'bar'
}
```
It also accept deep objects, for example:
```js
{
    "a" : {
        "a1" : {
            "a11" : CONF_FIELD,
            "a12  : CONF_FIELD
        },
        "a2" : CONF_FIELD
    },
    "b" : "CONF_FIELD
}
```
convert row [1,2,3,4] in:
```js
{
    "a" : {
        "a1" : {
            "a11" : 1,
            "a12  : 2
        },
        "a2" : 2
    },
    "b" : "3
}
```
Also, if you use object spec to convert an object in array (row) the process is exactly the opposite

### CONF_FIELD
Conf field is a special configuration that allow to automaticaly implement typical process to a value before converting to object/array. Valid values are:
- '': //Do nothing, pass throught value
- 'd': //Convert value from row in an integer and viceversa
- 'dz': //Convert value from row in an integer and viceversa. If value of cell is empty, assign 0
- 'f': //Convert value from row in a float and viceversa
- 'fz': //Convert value from row in a float and viceversa. If value of cell is empty, assign 0. Also detect ',' and convert in '.'
- 'dt': //Detect d/m/Y spanish and convert to Y-m-d
- 'b': Convert 1/0 values from excel into true/false in JS and viceversa
- 'sc': Implement a separated comma array. For example a value in cell like 1,2,3 is converted to [1,2,3] and viceversa





