const statusBarInstanceModule = (id, elementIds) => {
	'use strict';
	const instance = document.getElementById(elementIds[0]);

	// Your code for when widget instance removed from DOM here
	const cleanup = () => {
		// console.log(`statusBar-widget statusBarInstanceModule cleanup("${id}")`);
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

const statusBarModule = (() => {
	'use strict';

	const widgetInstances = {};

	function onInit() {
        //subscribeConnections();
		serviceModule.addEmulatorScenarioNoControlSystem(
			'./app/project/components/widgets/status-bar/status-bar-emulator.json'
		);
		// Uncomment the below line and comment the above to load the emulator all the time.
		// serviceModule.addEmulatorScenario("./app/project/components/widgets/status-bar/status-bar-emulator.json");
	}

	
    function FindLiveText() {
        updateModeText('MTR Flex Mode');
        updateDateTime();
    }

    function updateModeText(modeText){
        const modeElement = document.querySelector('.mode-text');
        modeElement.textContent = modeText;
    }

    function updateDateTime() {
        const timeElement = document.querySelector('.time-text');
        //const periodElement = document.querySelector('.period-text');
        const dateElement = document.querySelector('.date-text');

        const now = new Date();

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedTime = `${formattedHours}:${formattedMinutes}`;

        //const period = hours >= 12 ? 'pm' : 'am';

        // Format the date
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-US', options);

        // Update the content of the HTML elements
        timeElement.textContent = formattedTime;
        //periodElement.textContent = period;
        dateElement.textContent = formattedDate;
    }

	function updateHeaderDisplay(newMode){
        switch(newMode){
            case 1:
                updateModeText('MTR Flex Mode');
                break;
            case 2:
                updateModeText('Showroom Mode');
                break;
            default:
                //updateModeText('No Mode');
                break;
        }
    }

	
    /**
    * Initialise subscribers for Events from CrComLib
    */
    const modeSubscription = CrComLib.subscribeState('n', analogJoins.SourceModeButtonFb, (value) => {
        console.log("Feedback CrComLib :::: Custom Header ::: Receiving Mode Feedback :: Value: ", value);
        updateHeaderDisplay(value);
      });

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:statusBar-import-widget', (value) => {
		if (value['loaded']) {
			onInit();
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:statusBar-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:status-bar-widget', (value) => {
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
                FindLiveText();
                setInterval(updateDateTime, 1000);
				widgetInstances[value.id] = statusBarInstanceModule(value.id, value['elementIds']);
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
