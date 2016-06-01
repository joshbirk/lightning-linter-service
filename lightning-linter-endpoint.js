/*
 * Copyright (C) 2016 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/*Linter*/
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var cli = require('heroku-cli-util');
//var Linter = require('salesforce-lightning-cli/lib/linter.js');
var linter = require('eslint').linter;
var defaultConfig = require('salesforce-lightning-cli/lib/aura-component-config');
var defaultStyle = require('salesforce-lightning-cli/lib/code-style-rules');
var objectAssign = require('object-assign');

var formatter = require('eslint-friendly-formatter');
var bodyParser = require("body-parser");

function lint(source) {
    var config = {};
    objectAssign(config, defaultConfig);

    console.log(source);

    source = processSingletonCode(source);
   
    var messages = linter.verify(source,config,{
        allowInlineConfig: true, 
        quiet: true
        });
    console.log(messages);

    return messages;
}

// this computes the first position after all the comments (multi-line and single-line)
// from the top of the code
function afterCommentsPosition(code) {
    var position = 0;
    var match;
    do {
        // /\*.*?\*/
        match = code.match(/^(\s*(\/\*([\s\S]*?)\*\/)?\s*)/);
        if (!match || !match[1]) {
            match = code.match(/^(\s*\/\/.*\s*)/);
        }
        if (match && match[1]) {
            position += match[1].length;
            code = code.slice(match[1].length);
        }
    } while (match);
    return position;
}

function processSingletonCode(code) {
    // transform `({...})` into `"use strict"; exports = ({...});`
    var pos = afterCommentsPosition(code);
    if (code.charAt(pos) === '(') {
        code = code.slice(0, pos) + '"use strict"; exports = ' + code.slice(pos);
        pos = code.lastIndexOf(')') + 1;
        if (code.charAt(pos) !== ';') {
            code = code.slice(0, pos) + ';' + code.slice(pos);
        }
    }
    return code;
}

function processFunctionCode(code) {
    // transform `function () {}` into `"use strict"; exports = function () {};`
    var pos = afterCommentsPosition(code);
    if (code.indexOf('function', pos) === pos) {
        code = code.slice(0, pos) + '"use strict"; exports = ' + code.slice(pos);
        pos = code.lastIndexOf('}') + 1;
        if (code.charAt(pos) !== ';') {
            code = code.slice(0, pos) + ';' + code.slice(pos);
        }
    }
    return code;
}


module.exports = {

    createOrgReport: function(res,records) {
        var bundles = []
        var current_bundle = '';
        console.log('folding bundles for '+records.length+' records');
        for (var i = 0; i < records.length; i++){ //fold all bundles into one object
            console.log(records[i].AuraDefinitionBundle.DeveloperName != current_bundle);   
            if(records[i].AuraDefinitionBundle.DeveloperName != current_bundle) {
                console.log(records[i].AuraDefinitionBundle.DeveloperName);
                bundles.push({DeveloperName: records[i].AuraDefinitionBundle.DeveloperName});
                current_bundle = records[i].AuraDefinitionBundle.DeveloperName;
                console.log(bundles);
            }
        }

        console.log('folding components');
        for (var i = 0; i < bundles.length; i++) { //fold all components into bundles
            bundles[i].components = [];
            for (var x = 0; x < records.length; x++){ 
                if(records[x].AuraDefinitionBundle.DeveloperName == bundles[i].DeveloperName) {
                    bundles[i].components.push({DefType: records[x].DefType, Source: records[x].Source, messages: lint(records[x].Source)});
                }
            }
        }

        console.log('render reports');
        res.render('pg_lint_org',{
            bundles : bundles,
            login: false
          });
    },


    addRoutes: function(app,debug) {  
      if(debug) {console.log('setting up lint endpoint');}    

       //POST Singleton Lightning Code
        app.post('/lint', function (req, res) {
          var messages = lint(req.body);
          res.render('inc_lint',{
            messages : messages
          });
        });

        app.post('/lint-json', function (req, res) {
          var messages = lint(req.body);
          res.json(messages);
        });


        app.get('/lint', function (req,res) {
              res.render('pg_lint_code',{
                messages : null,
                login : req.session.accessToken == null
              });
        });
      

      if(debug) {console.log('endpoint set');}    

  }
}






