const airMediaControlInstanceModule = (id, elementIds) => {
	'use strict';

	const instance = document.getElementById(elementIds[0]);

	const cleanup = () => {
		// console.log(`airMediaControl-widget airMediaControlInstanceModule cleanup("${id}")`);
	};

	return {
		id,
		elementIds,
		instance,
		cleanup
	};
};

const airMediaControlModule = (() => {
	'use strict';

	const widgetInstances = {};

	/**
     * Initialize Method
     */
	function onInit() {
		// serviceModule.addEmulatorScenarioNoControlSystem(
		// 	'./app/project/components/widgets/air-media-surface/air-media-control/air-media-control-emulator.json'
		// );
		// Uncomment the below line and comment the above to load the emulator all the time.
		serviceModule.addEmulatorScenario(
			'./app/project/components/widgets/air-media-surface/air-media-control/air-media-control-emulator.json'
		);
	}

	function setupListener() {
		document.getElementById('ap-disconnect-users').addEventListener('click', handleDisconnectClick);
	}

	function handleDisconnectClick() {
		sendSignal.sendActionPulse(digitalJoins.AirMediaDisconnectUsers);
	}

	let userArea;
	let addressArea;
	let codeArea;

	function updateUserCount(count) {
		if (!userArea) {
			userArea = document.getElementById('ap-user-area');
		}

		if (userArea) {
			userArea.innerText = count;
		}
	}

	function updateAddressValue(value) {
		if (!addressArea) {
			addressArea = document.getElementById('ap-address-area');
		}

		if (addressArea) {
			addressArea.innerText = value;
		}
	}

	function updateLoginCode(value) {
		if (!codeArea) {
			codeArea = document.getElementById('ap-code-area');
		}

		if (codeArea) {
			codeArea.innerText = value;
		}
	}

	/**
    * Initialise subscribers for Events from CrComLib - 3 text areas Users - Address - Code
    */
	const userFeedbackSubscription = CrComLib.subscribeState('n', analogJoins.AirMediaUserFb, (count) => {
		console.log('Feedback CrComLib :::: Air Media ::: Receiving User Count Feedback :: Value: ', count);
		updateUserCount(count);
	});

	const addressFeedbackSubscription = CrComLib.subscribeState('s', serialJoins.AirMediaAddressFb, (value) => {
		console.log('Feedback CrComLib :::: Air Media ::: Receiving Address Feedback :: Value: ', value);
		updateAddressValue(value);
	});

	const codeFeedbackSubscription = CrComLib.subscribeState('s', serialJoins.AirMediaCodeFb, (value) => {
		console.log('Feedback CrComLib :::: Air Media ::: Receiving Code Feedback :: Value: ', value);
		updateLoginCode(value);
	});

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:airMediaControl-import-widget', (value) => {
		if (value['loaded']) {
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:airMediaControl-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:air-media-control-widget', (value) => {
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
				setupListener();
				onInit();
				widgetInstances[value.id] = airMediaControlInstanceModule(value.id, value['elementIds']);
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
