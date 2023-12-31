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

const shadeInputsInstanceModule = (id, elementIds) => {
	'use strict';

	// BEGIN::CHANGEAREA - your initialization code for each instance of widget goes here
	// console.log(`shadeInputs-widget shadeInputsInstanceModule("${id}", [${elementIds}])`);

	// choose one of the below
	// -- id is container element added around template content
	// -- elementIds[0] is the first element found in the template content
	// -- in shell template, elementIds[0] is usually the right choice
	// const instance = document.getElementById(id);
	const instance = document.getElementById(elementIds[0]);

	// Your code for when widget instance removed from DOM here
	const cleanup = () => {
		// console.log(`shadeInputs-widget shadeInputsInstanceModule cleanup("${id}")`);
	};

	// Your code changing public interface to instance module here
	return {
		id,
		elementIds,
		instance,
		cleanup
	};

	// END::CHANGEAREA
};

const shadeInputsModule = (() => {
	'use strict';

	// BEGIN::CHANGEAREA - your initialization code for each instance of widget goes here

	const widgetInstances = {};

	/**
     * Initialize Method
     */
	function onInit() {
		setupStaticButtons();
		// serviceModule.addEmulatorScenarioNoControlSystem(
		// 	'./app/project/components/widgets/shade-surface/shade-inputs/shade-inputs-emulator.json'
		// );
		// Uncomment the below line and comment the above to load the emulator all the time.
		serviceModule.addEmulatorScenario(
			'./app/project/components/widgets/shade-surface/shade-inputs/shade-inputs-emulator.json'
		);
	}

	/* ============================ Setup Static Events Start ============================ */
	let closeOverlay;
	function closePresetCreateOverlay(event, overlay, shadeControl) {
		//console.log("Here we are closing overlay...")
		if (event.target === overlay) {
			//console.log("Clicked overlay?...")
			overlay.style.display = 'none';
			shadeControl.style.display = 'flex';
			window.removeEventListener('click', closeOverlay);
		}
	}

	function openPresetCreateOverlay() {
		// I guess we use same overlay as Mic? If we can clone sliders to the overlay would be useful as well
		//console.log("Here we are creating overlay...")
		const overlay = document.getElementById('add-shade-overlay');
		const shadeControl = document.getElementById('shade-controls');

		// Position the overlay at the center of the subpage element
		overlay.style.display = 'flex';
		shadeControl.style.display = 'none';

		closeOverlay = (e) => closePresetCreateOverlay(e, overlay, shadeControl);
		window.addEventListener('click', closeOverlay);
	}

	/*
        *   This function sends an updated Shade Value to the Server.
        *   @param {jsonString} shadeLevelJsonString - The json string formatted update message to send to backend
        */
	function sendShadeLevelUpdate(shadeLevelJsonString) {
		sendSignal.sendSerialSignal(serialJoins.ShadeControlShadeLevel, shadeLevelJsonString);
	}

	let sliderManager = null;
	const sliderHtmlPrefix = 'shade';
	function setupStaticButtons() {
		const allOpen = document.getElementById('shade-all-open');
		const allClose = document.getElementById('shade-all-close');

		allOpen.addEventListener('click', sendAllShadesOpen);
		allClose.addEventListener('click', sendAllShadesClose);

		sliderManager = new DynamicSliderLogic(sliderHtmlPrefix);
		sliderManager.onSliderUpdate('sliderValueUpdate', handleShadeUpdateEvent);
	}

	function sendAllShadesOpen() {
		sendSignal.sendActionPulse(digitalJoins.ShadeControlAllOpen);
	}

	function sendAllShadesClose() {
		sendSignal.sendActionPulse(digitalJoins.ShadeControlAllClose);
	}

	function handleShadeUpdateEvent(event) {
		const shadeUpdateMessage = event.detail.sliderUpdateMessage;
		sendShadeLevelUpdate(shadeUpdateMessage);
	}
	/* ============================ Setup Static Events End ============================ */

	/* ============================ Parse Feedback Functions Start ============================ */
	function isValidShadeSliderConfig(obj) {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			'shadevalue' in obj &&
			typeof obj.id === 'number' &&
			typeof obj.label === 'string' &&
			typeof obj.shadevalue === 'number'
		);
	}

	function parseSliderConfigJsonString(sliderConfigJson) {
		console.log(
			'Feedback CrComLib :::: Shade Control ::: Receiving Slider Config Feedback :: Value: ',
			sliderConfigJson
		);
		if (sliderConfigJson && sliderConfigJson !== '') {
			try {
				const parsedObjects = JSON.parse(sliderConfigJson);

				if (Array.isArray(parsedObjects) && parsedObjects.every(isValidShadeSliderConfig) && sliderManager) {
					sliderManager.createDynamicSliders(parsedObjects);
				} else {
					console.error('Parsed objects do not match the expected structure.');
				}
			} catch (error) {
				console.error('Error parsing input:', error);
			}
		}
	}

	function isValidShadeFeedback(obj) {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'shadevalue' in obj &&
			typeof obj.id === 'number' &&
			typeof obj.shadevalue === 'number'
		);
	}

	function parseJsonSliderFeedback(shadeFeedbackJson) {
		console.log('CrComLib :::: Receiving Slider Feedback Json: ', shadeFeedbackJson);
		if (shadeFeedbackJson && shadeFeedbackJson !== '') {
			try {
				const parsedObject = JSON.parse(shadeFeedbackJson);

				if (isValidShadeFeedback(parsedObject) && sliderManager) {
					sliderManager.updateSliderLevel(parsedObject.id, parsedObject.shadevalue);
				} else {
					console.error('Parsed Shade Slider Feedback does not match the expected structure.');
				}
			} catch (error) {
				console.error('Error parsing input:', error);
			}
		}
	}
	/* ============================ Parse Feedback Functions End ============================ */

	/* ============================ Subscribe Feedback Events Start ============================ */

	// === Subscribe to Shade Slider Preset Feedback and Handle ===
	const shadeSliderConfigSubscription = CrComLib.subscribeState(
		's',
		serialJoins.ShadeControlShadesConfig,
		(value) => {
			parseSliderConfigJsonString(value);
		}
	);

	// === Subscribe to Shade Slider Feedback and Handle ===
	const shadeFeedbackSubscription = CrComLib.subscribeState('s', serialJoins.ShadeControlShadeLevelFb, (value) => {
		parseJsonSliderFeedback(value);
	});

	/* ============================ Subscribe Feedback Events End ============================ */

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:shadeInputs-import-widget', (value) => {
		if (value['loaded']) {
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:shadeInputs-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:shade-inputs-widget', (value) => {
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
				onInit();
				widgetInstances[value.id] = shadeInputsInstanceModule(value.id, value['elementIds']);
			} else {
				const removedInstance = widgetInstances[value.id];
				if (removedInstance) {
					removedInstance.cleanup();
					delete widgetInstances[value.id];
				}
			}
		}
	});
	/**
     * All public method and properties are exported here
     */
	return {
		widgetInstances
	};

	// END::CHANGEAREA
})();
