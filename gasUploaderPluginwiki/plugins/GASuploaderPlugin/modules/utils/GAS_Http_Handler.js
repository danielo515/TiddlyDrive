/*\
title: $:/plugins/danielo515/GASuploader/modules/utils/GAS_Http_Handler.js
type: application/javascript
module-type: utils

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var widget = require("$:/core/modules/widgets/widget.js");
var GAS_URL = "$:/plugins/danielo515/GASuploader/config/script_url";


var GAS_Http_Handler = function(wiki) {
	this.wiki = wiki;
	this.logger = new $tw.utils.Logger("GAS_Http_Handler");
};

GAS_Http_Handler.prototype.postTiddler = function(tiddlerName){
	var jsonTiddler = $tw.wiki.getTiddlerAsJson(tiddlerName),
	self = this;

	this.logger.log("Posting tiddler "+tiddlerName);
	
	$tw.utils.httpRequest({
		url: this.getURL("addTiddler"),
		type: "POST",
		data: jsonTiddler,
		callback: function(err,data){
			if(err) {
				return self.logger.log("Something went wrong while Posting",err);
			}else{
				self.logger.log("SUCCESS! ",data);
			}
		}
	});
};


GAS_Http_Handler.prototype.getURL = function (action){
	if(action){
			return [this.wiki.getTiddlerText(GAS_URL),"?action=",action].join("");
	}

	return this.wiki.getTiddlerText(GAS_URL);
};

exports.GAS_Http_Handler = GAS_Http_Handler;

})();