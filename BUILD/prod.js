/* BUILD FILE */
const fs = require('fs');
const UglifyJS = require('uglify-js');
const files = [
     'SRC/list.js', 
     'SRC/dom.js', 
     'SRC/data.js', 
     'SRC/oml.js', 
     'SRC/ose.js', 
     'SRC/object.js', 
     'SRC/display.js', 
     'SRC/uxi.js', 
     'SRC/touch.js', 
     'SRC/touches.js', 
     'SRC/events.js', 
     'SRC/net.js', 
     'SRC/stage.js', 
     'SRC/view.js', 
     'SRC/app.js'
];
const mergedCode = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const result = UglifyJS.minify(mergedCode);
fs.writeFileSync('DIST/ogx.min.js', result.code);