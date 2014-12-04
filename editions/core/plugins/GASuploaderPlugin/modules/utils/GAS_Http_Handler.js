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
var STATE_UPLOADING = "$:/plugins/danielo515/GASuploader/temp/uploading",
    STATE_UPLOADED = "$:/plugins/danielo515/GASuploader/temp/uploaded",
    GAS_SUBFOLDER = "$:/plugins/danielo515/GASuploader/config/subfolder",
    config;


var GAS_Http_Handler = function(wiki) {
	this.wiki = wiki;
	this.logger = new $tw.utils.Logger("GAS_Http_Handler");
	this.importer = require("$:/plugins/danielo515/GASuploader/lib/tiddlerImporter.js").GAS_importer;
	var utils = require("$:/plugins/danielo515/GASuploader/lib/utils.js").utils;
	this.getURL = utils["getURL"];
	config = utils.config;
};


GAS_Http_Handler.prototype.genericCallback = function(callback){
	self = this;
	return function(err,data){
		if(err){
			self.logger.log(config.server_communication_error,err);
			self.displayNotification(config.server_communication_error,err,"");
		}else{
			callback(data);
		}
	};
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
		url: this.getURL("addTiddlers", this.getSubfolderOption()),
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
			//response should contain an array of tiddler fields
			if(response.forEach){
				response.forEach(function(tiddler){
					self.updateTiddler(tiddler.title,tiddler);
				});
				self.setUploadedState();
			}
		}

		self.removeProcessingState();
	}

};

GAS_Http_Handler.prototype.updateTiddler=function(tiddlerTitle,newFields){
	var fields = $tw.wiki.getTiddler(tiddlerTitle).fields;
	$tw.wiki.addTiddler(new $tw.Tiddler(fields,{"gas_id":newFields.id,"gas_uploaded": new Date()}));
	this.logger.log("Updated ",tiddlerTitle," with id: ",newFields.id);
};

GAS_Http_Handler.prototype.postTiddler = function(tiddlerName){

	this.postTiddlers(["[title[",tiddlerName,"]]"].join(""));

};

GAS_Http_Handler.prototype.listTiddlers = function(folder){
	var self = this;

	this.displayNotification("list folder",folder);

	$tw.utils.httpRequest({
		url: this.getURL("listTiddlers",this.getSubfolderOption(folder)),
		type: "GET",
		callback: listTiddlersCallback
	});

	function listTiddlersCallback(err,data){
		if(err){
			self.logger.log(config.server_communication_error,err);
			this.displayNotification(config.server_communication_error,err,"");
		}else{
			self.logger.log("List retrieved from server: ",data);
			self.importer.toPluginTiddler(JSON.parse(data).response,config.server_list);
			self.displayNotification(config.folder_listed,folder,"");
		}
	}
};

GAS_Http_Handler.prototype.listAllTiddlersExcept = function(titlesArray,callback){
	var self = this;

	this.displayNotification("fetch","new tiddlers from server");

	$tw.utils.httpRequest({
		url: this.getURL("listTiddlers"),
		type: "POST",
		data: JSON.stringify(titlesArray),
		callback: self.genericCallback(callback)
	});
};

GAS_Http_Handler.prototype.getTiddlers = function(descriptionsArray){
	var self = this;
	this.setProcessingState("download");

	$tw.utils.httpRequest({
		url: this.getURL("getTiddlers"),
		type: "POST",
		callback: getTiddlersCallback,
		data: JSON.stringify(descriptionsArray)
	});

	function getTiddlersCallback(err,data){
		if(err) {
		 self.logger.log("Something went wrong while gettingTiddler ",err);
		}else{
			self.logger.log("Got response from server!");self.logger.log(data);
			var response = JSON.parse(data).response;
			if(response){
				if(config.import_manager()){
					self.importer.interactive(config.import_tiddler,response,true);
				}else{
					self.importer.silently(response);
				}
			}
		}
	self.removeProcessingState();
	}
};


GAS_Http_Handler.prototype.getTiddlerbyID = function(tiddlerTitle){
	// try to get the tiddler from  the list of available tiddlers on server , if not fallback to tiddler store
	var tiddler = this.wiki.getSubTiddler(config.server_list,tiddlerTitle) || this.wiki.getTiddler(tiddlerTitle),
	self=this;
	this.tiddlerBeingProcessed = tiddlerTitle;
	if(tiddler){
		var fields=tiddler.fields,
			id=fields.gas_id || fields.id; //id cames from server, gas_id from tiddler. Should be changed?
		if(id){
			this.getTiddlers([{"id":id}]); //single item array case
		}else{ 
			self.logger.log("The tiddler ",tiddlerTitle," does not have a valid gas_id");
		}
	}else { self.logger.log("No information found for ",tiddlerTitle," in any of the stores");}
};


GAS_Http_Handler.prototype.getTiddlerbyTitle = function(tiddlerTitle){
	this.tiddlerBeingProcessed = tiddlerTitle;
	this.getTiddlers([{"title":tiddlerTitle}]);//single item array case
};

/* Returns the a folder name in the form required by getUrl
   @foldername a folder name to add to the option. If not provided fallback to the
    	wiki globaly defined */
GAS_Http_Handler.prototype.getSubfolderOption= function(foldername){
	this.logger.log("So you want the folder  ",foldername);
	var subfolder = foldername || this.getSubfolder();
	if(subfolder){
		return {"folder":subfolder};
	}
	
	return undefined; //undefined is processed as option
};

GAS_Http_Handler.prototype.getSubfolder = function (){
	var subfolder = this.wiki.getTiddlerText(GAS_SUBFOLDER);

	return subfolder? subfolder.trim() : undefined;//undefined better than empty string
};

exports.GAS_Http_Handler = GAS_Http_Handler;

})();