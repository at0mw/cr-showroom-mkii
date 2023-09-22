/**
 * Copyright (C) 2023 to the present, Crestron Electronics, Inc.
 * All rights reserved.
 * No part of this software may be reproduced in any form, machine
 * or natural, without the express written consent of Crestron Electronics.
 * Use of this source code is subject to the terms of the Crestron Software License Agreement 
 * under which you licensed this source code.  
 *
 * This code was automatically generated by Crestron's code generation tool.
*/
/*jslint es6 */
/*global serviceModule, CrComLib */

const mainModule = (() => {
	'use strict';

	// BEGIN::CHANGEAREA - your javascript for page module code goes here

	/**
     * Initialize Method
     */
	function onInit() {
		serviceModule.addEmulatorScenarioNoControlSystem('./app/project/components/pages/main/main-emulator.json');
		// Uncomment the below line and comment the above to load the emulator all the time.
		// serviceModule.addEmulatorScenario("./app/project/components/pages/main/main-emulator.json");
		// window.addEventListener('contextmenu', function(event) {
		// 	event.preventDefault(); // Prevent the default context menu behavior
		// });
	}

	/**
     * private method for page class initialization
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:main-import-page', (value) => {
		if (value['loaded']) {
			onInit();
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:main-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * All public method and properties are exported here
     */
	return {};

	// END::CHANGEAREA
})();
