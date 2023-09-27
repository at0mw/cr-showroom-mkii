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

const settingsLogInstanceModule = (id, elementIds) => {
    'use strict';    

    const instance = document.getElementById(elementIds[0]);

    // Your code for when widget instance removed from DOM here
    const cleanup = () => {
        // console.log(`settingsLog-widget settingsLogInstanceModule cleanup("${id}")`);
    };

    // Your code changing public interface to instance module here 
    return {
        id,
        elementIds,
        instance,
        cleanup
    };

    // END::CHANGEAREA  
} 

const settingsLogModule = (() => {
    'use strict';

    // BEGIN::CHANGEAREA - your initialization code for each instance of widget goes here  
   
    const widgetInstances = {};

    /**
     * Initialize Method
     */
    function onInit() {
    //    serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/widgets/settings-surface/settings-log/settings-log-emulator.json");
       // Uncomment the below line and comment the above to load the emulator all the time.
       serviceModule.addEmulatorScenario("./app/project/components/widgets/settings-surface/settings-log/settings-log-emulator.json");
    }

    function setupStatics() {
        document.getElementById('settings-log-save').addEventListener('click', handleSaveCommand);
        document.getElementById('settings-log-clear').addEventListener('click', handleClearCommand);
    }

    function handleClearCommand() {
        sendSignal.sendActionPulse(digitalJoins.SettingsLogClear);
    }

    function handleSaveCommand() {
        sendSignal.sendActionPulse(digitalJoins.SettingsLogSave);
    }

    let displayArea;
    function updateLogArea(value) {
        if(!displayArea) {
            displayArea = document.getElementById('settings-log-area');
        }
        if(displayArea) {
            displayArea.innerText = value;
        }
    }

	// === Subscribe to Log Feedback and Handle ===
	const logSubscription = CrComLib.subscribeState('s', serialJoins.SettingsLogFeedback, (value) => {
		console.log('Feedback CrComLib :::: String Join ', serialJoins.SettingsLogFeedback, ' ::: Value :: ', value);
		updateLogArea(value);
	});

    /**
     * private method for widget class creation
     */
    let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:settingsLog-import-widget', (value) => {
        if (value['loaded']) {
            setTimeout(() => {
                CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:settingsLog-import-page', loadedSubId);
                loadedSubId = '';
            });
        }
    });

    /**
     * private method for widget instance addition and removal
     */
    CrComLib.subscribeState('o', 'ch5-template:settings-log-widget', (value) => {
        if (value['loaded'] !== undefined && value['id'] !== undefined) {
            if (value.loaded) {
                onInit();
                setupStatics();
                widgetInstances[value.id] = settingsLogInstanceModule(value.id, value['elementIds']);
            }
            else {
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