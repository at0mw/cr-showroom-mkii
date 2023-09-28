const homeControlInstanceModule = (id, elementIds) => {
    'use strict';    

    const instance = document.getElementById(elementIds[0]);

    const cleanup = () => {
        // console.log(`homeControl-widget homeControlInstanceModule cleanup("${id}")`);
    };

    return {
        id,
        elementIds,
        instance,
        cleanup
    };

    // END::CHANGEAREA  
} 

const homeControlModule = (() => {
    'use strict';

   
    const widgetInstances = {};

    /**
     * Initialize Method
     */
    function onInit() {
    //    serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/widgets/home-surface/home-control/home-control-emulator.json");
       // Uncomment the below line and comment the above to load the emulator all the time.
       serviceModule.addEmulatorScenario("./app/project/components/widgets/home-surface/home-control/home-control-emulator.json");
    }

    let homeButtonContainer;
    function setupStatics() {
        homeButtonContainer = document.getElementById('home-buttons-container');

        homeButtonContainer.addEventListener('click', handleHomePress);
    }

	function handleHomePress(event) {
        const clickedIcon = event.target.closest(".box-button");

        if (clickedIcon) {
			const iconId = clickedIcon.id;
			console.log("Home Button clicked with ID:", iconId);        
        }
    }

    /*
        Handle Device IP Tables
    */
	function updateConfigButtons(configData) {
        configData.forEach(config => {
            const button = document.createElement("div");
            button.className = "box-button button";
            button.id = `home-button:${config.id}`;

            const buttonText = document.createElement("h3");
            buttonText.className = "box-button-text unclickable";
            buttonText.textContent = config.label;

            const buttonIcon = document.createElement("div");
            buttonIcon.className = "box-button-icon unclickable";
            const icon = document.createElement("i");
            icon.className = config.icon;
            icon.style.padding = "0";
            icon.style.fontSize = "50px";
            buttonIcon.appendChild(icon);

            button.appendChild(buttonText);
            button.appendChild(buttonIcon);
            homeButtonContainer.appendChild(button);
        });
	}

	function isHomeConfig(obj) {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			'icon' in obj &&
			typeof obj.id === 'number' &&
			typeof obj.label === 'string' &&
			typeof obj.icon === 'string'
		);
	}

	function parseConfigJsonString(configJson) {
		if (configJson && configJson !== '') {
			try {
				const parsedObjects = JSON.parse(configJson);

				if (Array.isArray(parsedObjects) && parsedObjects.every(isHomeConfig)) {
					updateConfigButtons(parsedObjects);
				} else {
					console.error('Parsed objects do not match the expected structure.');
				}
			} catch (error) {
				console.error('Error parsing input:', error);
			}
		}
	}

	/**
     *  Handle Subscriptions
     */
	const configSubscription = CrComLib.subscribeState('s', serialJoins.HomeControlConfig, (value) => {
		console.log(
			'Feedback CrComLib :::: Home Control ',
			serialJoins.HomeControlConfig,
			' ::: Json Config :: ',
			//value
		);
		parseConfigJsonString(value);
	});

    /**
     * private method for widget class creation
     */
    let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:homeControl-import-widget', (value) => {
        if (value['loaded']) {
            setTimeout(() => {
                CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:homeControl-import-page', loadedSubId);
                loadedSubId = '';
            });
        }
    });

    /**
     * private method for widget instance addition and removal
     */
    CrComLib.subscribeState('o', 'ch5-template:home-control-widget', (value) => {
        if (value['loaded'] !== undefined && value['id'] !== undefined) {
            if (value.loaded) {
                onInit();
                setupStatics();
                widgetInstances[value.id] = homeControlInstanceModule(value.id, value['elementIds']);
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