const settingsDeviceStatusInstanceModule = (id, elementIds) => {
	'use strict';

	const instance = document.getElementById(elementIds[0]);

	const cleanup = () => {};

	return {
		id,
		elementIds,
		instance,
		cleanup
	};
};

const settingsDeviceStatusModule = (() => {
	'use strict';

	const widgetInstances = {};

	/**
     * Initialize Method
     */
	function onInit() {
		//    serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/widgets/settings-surface/settings-device-status/settings-device-status-emulator.json");
		// Uncomment the below line and comment the above to load the emulator all the time.
		serviceModule.addEmulatorScenario(
			'./app/project/components/widgets/settings-surface/settings-device-status/settings-device-status-emulator.json'
		);
	}
    let deviceStatusContainer;
    let ipTableContainer;
    function setupStatics() {
        deviceStatusContainer = document.getElementById('device-status-container');
        ipTableContainer = document.getElementById('ip-table-container');

        deviceStatusContainer.addEventListener('click', handleDeviceStatusIconPress);
        ipTableContainer.addEventListener('click', handleIpTableIconPress);
    }

	function handleDeviceStatusIconPress(event) {
        const clickedIcon = event.target.closest(".list-item-icon");

        if (clickedIcon) {
			const iconId = clickedIcon.id;
			console.log("Device Status Icon clicked with ID:", iconId);        
        }
    }

	function handleIpTableIconPress(event) {
        const clickedIcon = event.target.closest(".list-item-icon");

        if (clickedIcon) {
			const iconId = clickedIcon.id;
			console.log("Ip Table Icon clicked with ID:", iconId);        
        }
    }

	/*
        Handle Device Status
    */
	function updateDeviceStatusList(deviceStatusList) {
		deviceStatusList.forEach((config) => {
			// Create the outer div for each item
			const listItem = document.createElement('div');
			listItem.classList.add('list-item');

			// Create the div for the label
			const listItemText = document.createElement('div');
			listItemText.classList.add('list-item-text');
			listItemText.textContent = config.label;

			// Create the div for icons
			const iconGroup = document.createElement('div');
			iconGroup.classList.add('list-item-icon-group');

			// Create three icon divs
			for (let i = 1; i <= 3; i++) {
				const iconDiv = document.createElement('div');
				iconDiv.classList.add('list-item-icon');
				iconDiv.id = `dev_stat_icon_${i}:${config.id}`;

				// Create the icon element (assuming you have a font awesome library loaded)
				const icon = document.createElement('i');
				icon.classList.add(`fa-${i === 1 ? 'kit' : 'regular'}`);
				icon.classList.add(
					`fa-${i === 1 ? 'microsoft-teams' : i === 2 ? 'power-off' : 'triangle-exclamation'}`
				);

				// Append the icon to the icon div
				iconDiv.appendChild(icon);

				// Append the icon div to the icon group
				iconGroup.appendChild(iconDiv);
			}

			// Append label and icon group to the outer div
			listItem.appendChild(listItemText);
			listItem.appendChild(iconGroup);

			// Append the outer div to the container
			deviceStatusContainer.appendChild(listItem);
		});
	}

	function isValidDeviceStatusConfig(obj) {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			typeof obj.id === 'number' &&
			typeof obj.label === 'string'
		);
	}

	function parseStatusConfigJsonString(deviceStatusConfigJson) {
		if (deviceStatusConfigJson && deviceStatusConfigJson !== '') {
			try {
				const parsedObjects = JSON.parse(deviceStatusConfigJson);

				if (Array.isArray(parsedObjects) && parsedObjects.every(isValidDeviceStatusConfig)) {
					updateDeviceStatusList(parsedObjects);
				} else {
					console.error('Parsed objects do not match the expected structure.');
				}
			} catch (error) {
				console.error('Error parsing input:', error);
			}
		}
	}

	/*
        Handle Device IP Tables
    */
	function updateIpTableList(deviceStatusList) {
		deviceStatusList.forEach((config) => {
			// Create the outer div for each item
			const listItem = document.createElement('div');
			listItem.classList.add('list-item');

			// Create the div for the label
			const listItemText = document.createElement('div');
			listItemText.classList.add('list-item-text');
			listItemText.textContent = config.label;

			// Create the div for icons
			const iconGroup = document.createElement('div');
			iconGroup.classList.add('list-item-icon-group');

			// Create three icon divs
			for (let i = 1; i <= 3; i++) {
				const iconDiv = document.createElement('div');
				iconDiv.classList.add('list-item-icon');
				iconDiv.id = `dev_stat_icon_${i}:${config.id}`;

				// Create the icon element (assuming you have a font awesome library loaded)
				const icon = document.createElement('i');
				icon.classList.add(`fa-${i === 1 ? 'kit' : 'regular'}`);
				icon.classList.add(
					`fa-${i === 1 ? 'microsoft-teams' : i === 2 ? 'power-off' : 'triangle-exclamation'}`
				);

				// Append the icon to the icon div
				iconDiv.appendChild(icon);

				// Append the icon div to the icon group
				iconGroup.appendChild(iconDiv);
			}

			// Append label and icon group to the outer div
			listItem.appendChild(listItemText);
			listItem.appendChild(iconGroup);

			// Append the outer div to the container
			ipTableContainer.appendChild(listItem);
		});
	}

	function isValidIpTableConfig(obj) {
		return (
			typeof obj === 'object' &&
			obj !== null &&
			'id' in obj &&
			'label' in obj &&
			typeof obj.id === 'number' &&
			typeof obj.label === 'string'
		);
	}

	function parseIpTableConfigJsonString(deviceStatusConfigJson) {
		if (deviceStatusConfigJson && deviceStatusConfigJson !== '') {
			try {
				const parsedObjects = JSON.parse(deviceStatusConfigJson);

				if (Array.isArray(parsedObjects) && parsedObjects.every(isValidIpTableConfig)) {
					updateIpTableList(parsedObjects);
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
	const devStatusSubscription = CrComLib.subscribeState('s', serialJoins.SettingsDeviceStatusConfig, (value) => {
		console.log(
			'Feedback CrComLib :::: Settings Device ',
			serialJoins.SettingsDeviceStatusConfig,
			' ::: JsonConfig :: ',
			//value
		);
		parseStatusConfigJsonString(value);
	});

	const ipTableSubscription = CrComLib.subscribeState('s', serialJoins.SettingsIpTableConfig, (value) => {
		console.log(
			'Feedback CrComLib :::: Settings Device ',
			serialJoins.SettingsIpTableConfig,
			' ::: JsonConfig :: ',
			//value
		);
		parseIpTableConfigJsonString(value);
	});

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState(
		'o',
		'ch5-import-htmlsnippet:settingsDeviceStatus-import-widget',
		(value) => {
			if (value['loaded']) {
				setTimeout(() => {
					CrComLib.unsubscribeState(
						'o',
						'ch5-import-htmlsnippet:settingsDeviceStatus-import-page',
						loadedSubId
					);
					loadedSubId = '';
				});
			}
		}
	);

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:settings-device-status-widget', (value) => {
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
				onInit();
                setupStatics();
				widgetInstances[value.id] = settingsDeviceStatusInstanceModule(value.id, value['elementIds']);
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
