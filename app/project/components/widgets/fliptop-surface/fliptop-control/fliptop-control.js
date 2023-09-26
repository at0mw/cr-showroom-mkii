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

const fliptopControlInstanceModule = (id, elementIds) => {
    'use strict';    

    // BEGIN::CHANGEAREA - your initialization code for each instance of widget goes here  
    // console.log(`fliptopControl-widget fliptopControlInstanceModule("${id}", [${elementIds}])`);

    // choose one of the below 
    // -- id is container element added around template content
    // -- elementIds[0] is the first element found in the template content
    // -- in shell template, elementIds[0] is usually the right choice
    // const instance = document.getElementById(id);
    const instance = document.getElementById(elementIds[0]);

    // Your code for when widget instance removed from DOM here
    const cleanup = () => {
        // console.log(`fliptopControl-widget fliptopControlInstanceModule cleanup("${id}")`);
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

const fliptopControlModule = (() => {
    'use strict';

    // BEGIN::CHANGEAREA - your initialization code for each instance of widget goes here  
   
    const widgetInstances = {};

    /**
     * Initialize Method
     */
    function onInit() {
       serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/widgets/fliptop-control/fliptop-control-emulator.json");
       // Uncomment the below line and comment the above to load the emulator all the time.
       // serviceModule.addEmulatorScenario("./app/project/components/widgets/fliptop-control/fliptop-control-emulator.json");
    }

    function setupStatic() {
        setupStaticButtons();          
    }

    function setupStaticButtons() {
        //console.log("Attempting to find Retract Buttons:");
        const retractButtons = document.querySelectorAll('.retract-button');
        retractButtons.forEach(button => {
            //console.log("Adding Listeners to Retract Buttons!!!!!");
            //button.addEventListener('click', handleNothing);
            button.addEventListener('mousedown', handleRetractAction);
            button.addEventListener('touchstart', handleRetractAction);

            button.addEventListener('mouseup', handleStopAction);
            button.addEventListener('touchend', handleStopAction);
          });
    }

    function handleNothing() {
        console.log("Does this trigger active?");
    }

    function handleRetractAction(event) {
        //console.log("Handle Retract...");
        //event.preventDefault();
        const buttonTextId = event.target.id.split(':');
        if (buttonTextId.length > 1 && !isNaN(buttonTextId[1])) {
            const buttonNumId = parseInt(buttonTextId[1], 10);
            retract(buttonNumId, true);
        } else {
            console.error('Source Button has returned invalid source id');
        }
    }

    function handleStopAction(event) {
        //console.log("Handle Stop Retract...");
        event.preventDefault();
        const buttonTextId = event.target.id.split(':');
        if (buttonTextId.length > 1 && !isNaN(buttonTextId[1])) {
            const buttonNumId = parseInt(buttonTextId[1], 10);
            retract(buttonNumId, false);
        } else {
            console.error('Source Button has returned invalid source id');
        }
    }

    function retract(id, state) {
        switch(id) {
            case 1:
                sendSignal.sendDigitalSignal(digitalJoins.FlipTopsRetract1, state);
                break;
            case 2:
                sendSignal.sendDigitalSignal(digitalJoins.FlipTopsRetract2, state);
                break;
            case 3:
                sendSignal.sendDigitalSignal(digitalJoins.FlipTopsRetract3, state);
                break;
        }
    }

    /**
     * private method for widget class creation
     */
    let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:fliptopControl-import-widget', (value) => {
        if (value['loaded']) {
            setTimeout(() => {
                CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:fliptopControl-import-page', loadedSubId);
                loadedSubId = '';
            });
        }
    });

    /**
     * private method for widget instance addition and removal
     */
    CrComLib.subscribeState('o', 'ch5-template:fliptop-control-widget', (value) => {
        if (value['loaded'] !== undefined && value['id'] !== undefined) {
            if (value.loaded) {
                onInit();
                setupStatic();
                widgetInstances[value.id] = fliptopControlInstanceModule(value.id, value['elementIds']);
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