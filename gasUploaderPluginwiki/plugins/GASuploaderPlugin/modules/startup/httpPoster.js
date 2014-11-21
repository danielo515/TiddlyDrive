/*\
title: $:/plugins/danielo515/GASuploader/modules/startup/listener.js
type: application/javascript
module-type: startup


\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "httpposter";
exports.platforms = ["browser"];
exports.after = ["startup"];
exports.synchronous = true;


exports.startup = function() {
	$tw.GAS_Http_Handler = new $tw.utils.GAS_Http_Handler($tw.wiki);
	$tw.rootWidget.addEventListener("pm-GAS-http-upload",function(event) {
		$tw.GAS_Http_Handler.postTiddler(event.param);
	});
};

})();
