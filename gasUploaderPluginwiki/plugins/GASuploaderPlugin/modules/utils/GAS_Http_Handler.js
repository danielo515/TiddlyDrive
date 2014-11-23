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
var STATE_UPLOADING = "$:/plugins/danielo515/GASuploader/temp/uploading",
    STATE_UPLOADED = "$:/plugins/danielo515/GASuploader/temp/uploaded"


var GAS_Http_Handler = function(wiki) {
	this.wiki = wiki;
	this.logger = new $tw.utils.Logger("GAS_Http_Handler");
};


GAS_Http_Handler.prototype.postTiddlers = function(tiddlersFilter){
 	if(tiddlersFilter === "") { return }
	var tiddlersList=$tw.wiki.filterTiddlers(tiddlersFilter),self=this,
	tiddlersCollection=[];
	
	if(tiddlersList.length === 0){
		this.displayNotification("Error","empty tiddlers list"," ");
		this.removeProcessingState();
	}

	tiddlersList.forEach(function(title){
		tiddlersCollection.push($tw.wiki.getTiddler(title).fields);
	});

	var postData = JSON.stringify(tiddlersCollection);
	self.logger.log("PostData: ",postData);

	this.tiddlerBeingProcessed=tiddlersList.length === 1 ? tiddlersList[0] : tiddlersList.length+" tiddlers";
	this.setProcessingState("upload");

	$tw.utils.httpRequest({
		url: this.getURL("addTiddlers"),
		type: "POST",
		data: postData,
		callback: postTiddlersCallback
	});

	function postTiddlersCallback(err,data){
		if(err) {
		 self.logger.log("Something went wrong while Posting ",err);
		}else{
			self.logger.log("Got respose from server!");
			self.logger.log(data);
			var response = JSON.parse(data).response;
			if(response.forEach){
				response.forEach(function(tiddler){
					self.setTiddlerID(tiddler.title,tiddler.id);
				});
				self.setUploadedState();
			}
		}

		self.removeProcessingState();
	}

};

GAS_Http_Handler.prototype.setTiddlerID=function(tiddlerTitle,gas_id){
	var fields = $tw.wiki.getTiddler(tiddlerTitle).fields;
	$tw.wiki.addTiddler(new $tw.Tiddler(fields,{"gas_id":gas_id}));
	this.logger.log("Updated ",tiddlerTitle," with id: ",gas_id);
}

GAS_Http_Handler.prototype.postTiddler = function(tiddlerName){

	this.postTiddlers(["[title[",tiddlerName,"]]"].join(""));

};


GAS_Http_Handler.prototype.setProcessingState = function(action){
	this.logger.log("Posting tiddler ",this.tiddlerBeingProcessed);
	this.setState(STATE_UPLOADING,this.tiddlerBeingProcessed);
	this.displayNotification(action,this.tiddlerBeingProcessed);
};

GAS_Http_Handler.prototype.setUploadedState = function(){
	this.wiki.addTiddler( new $tw.Tiddler({"title":STATE_UPLOADED,"text":this.uploadingTiddler}));
	$tw.notifier.display("$:/plugins/danielo515/GASuploader/language/Notifications/Saved/Tiddler");
};

GAS_Http_Handler.prototype.removeProcessingState = function(){
	this.wiki.addTiddler( new $tw.Tiddler({"title":STATE_UPLOADING,"text":""}));
	this.tiddlerBeingProcessed = "";
};

GAS_Http_Handler.prototype.setState = function(stateTiddler,tiddlerBeingProcessed){
	this.wiki.addTiddler( new $tw.Tiddler({"title":stateTiddler,"text":tiddlerBeingProcessed}));
};

GAS_Http_Handler.prototype.displayNotification = function(action,text,prefix){
	var message = [prefix || "Starting to",action,text].join(" "),
	notificationTiddler="$:/state/GAS/Processing";
	this.wiki.addTiddler( new $tw.Tiddler({"title":notificationTiddler,"text":message}));
	$tw.notifier.display(notificationTiddler);
};

GAS_Http_Handler.prototype.getTiddler = function(query){
	var self = this;
	this.setProcessingState("download");

	$tw.utils.httpRequest({
		url: this.getURL("getTiddler",query),
		type: "GET",
		callback: getTiddlerCallback
	});

	function getTiddlerCallback(err,data){
		if(err) {
		 self.logger.log("Something went wrong while gettingTiddler ",err);
		}else{
			self.logger.log("SUCCESS getting tiddler!");self.logger.log(data);
			var response = JSON.parse(data).response;
			if(response.tiddler){
				$tw.wiki.addTiddler(new $tw.Tiddler(response.tiddler));
			}
		}
	self.removeProcessingState();
	}
};


GAS_Http_Handler.prototype.getTiddlerbyID = function(tiddlerTitle){
	var tiddler = this.wiki.getTiddler(tiddlerTitle),
	self=this;
	this.tiddlerBeingProcessed = tiddlerTitle;
	if(tiddler){
		var fields=tiddler.fields;
		if(fields.gas_id){
			this.getTiddler({"id":fields.gas_id});
		}else{ 
			self.logger.log("The tiddler ",tiddlerTitle," does not have a valid gas_id");
		}
	}
};


GAS_Http_Handler.prototype.getTiddlerbyTitle = function(tiddlerTitle){
	this.tiddlerBeingProcessed = tiddlerTitle;
	this.getTiddler({"title":tiddlerTitle});
};


GAS_Http_Handler.prototype.getURL = function (action,options){
	if(action){ //action on url required
		var url = [this.wiki.getTiddlerText(GAS_URL),"?action=",action];
		if(options){ //if there are options push those options into the url
			$tw.utils.each(options,function(value,name){
				url.push("&");url.push(name);url.push("=");url.push(value);
			});
		}
			return url.join("");
	}

	return this.wiki.getTiddlerText(GAS_URL);
};

exports.GAS_Http_Handler = GAS_Http_Handler;

})();