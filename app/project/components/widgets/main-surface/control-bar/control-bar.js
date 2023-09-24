const controlBarInstanceModule = (id, elementIds) => {
	'use strict';

	const instance = document.getElementById(elementIds[0]);

	// Your code for when widget instance removed from DOM here
	const cleanup = () => {
	};

	return {
		id,
		elementIds,
		instance,
		cleanup
	};

};

const controlBarModule = (() => {
	'use strict';

	const widgetInstances = {};
    // State variables for mic and volume mute
    let isMicUnMuted = false;
    let isVolUnMuted = false;
    let isMicsMenuOpen = false;

    // Local variable for Volume
    let volumeLevel = 0;

	/**
     * Initialize Method
     */
	function onInit() {
		serviceModule.addEmulatorScenarioNoControlSystem(
			'./app/project/components/widgets/control-bar/control-bar-emulator.json'
		);
		// Uncomment the below line and comment the above to load the emulator all the time.
		// serviceModule.addEmulatorScenario("./app/project/components/widgets/control-bar/control-bar-emulator.json");
	}

	/**
     * Setup Static Events for Buttons in a module
     */
	function setupEvents() {
		//console.log("Setting Up Events for Mode");
		const micMute = document.getElementById('micMute');
		const volMute = document.getElementById('volMute');
		const micOverlay = document.getElementById('mics');

		micMute.addEventListener('click', handleMicMute);
		volMute.addEventListener('click', handleVolMute);
		micOverlay.addEventListener('click', handleMicsMenu);

		// const volumeSlider = document.querySelector('.volume-slider');

		// volumeSlider.addEventListener('change', handleVolChange);
		// volumeLevel = volumeSlider.value;

		subscribeToSliderEvents();
	}

	// Setup Subscriptions
	function subscribeToSliderEvents() {
		//console.log("Subscribing to Events in Dynamic Slider Logic...");
		window.addEventListener('resize', handleSliderInput);

		// Setup listeners for all sliders
		const volumeInput = document.getElementById('volume-input');
		volumeInput.addEventListener('input', sliderUserInput, false);
		volumeInput.addEventListener('change', handleVolChange);

		// const downButton = document.getElementById('volume-down');
		// downButton.addEventListener('click', handlevolumeDownClick);

		// const upButton = document.getElementById('volume-up');
		// upButton.addEventListener('click', handlevolumeUpClick);
	}

	function handleSliderInput() {
		showSliderValue(false);
	}

	function sliderUserInput() {
		showSliderValue(true);
	}

	function showSliderValue(showThumb) {
		// TODO Only one instance of this widget is therefore useable, can replace with context?
		const sliderInput = document.getElementById('volume-input');
		const sliderThumb = document.getElementById('volume-thumb');
		const sliderLine = document.getElementById('volume-line');

		if (sliderInput && sliderThumb && sliderLine) {
			if (showThumb) {
				revealThumbMovementVisuals(sliderThumb);
			}
			updateSliderAndThumbPosition(sliderInput, sliderThumb, sliderLine);
		}
	}

	let thumbDisappearTimeout;
	function revealThumbMovementVisuals(sliderThumb) {
		let thumbText = sliderThumb.querySelector('.thumb-text');
		thumbText.style.opacity = 1;
		if (thumbDisappearTimeout) {
			clearTimeout(thumbDisappearTimeout);
		}
		sliderThumb.classList.add('active');
		sliderThumb.style.opacity = '1';

		thumbDisappearTimeout = setTimeout(() => {
			thumbText.style.opacity = 0;
			sliderThumb.classList.remove('active');
		}, 1500);
	}

	function updateSliderAndThumbPosition(sliderInput, sliderThumb, sliderLine) {
		let thumbText = sliderThumb.querySelector('.thumb-text');
		thumbText.innerHTML = sliderInput.value;
		const bulletPosition = sliderInput.value / sliderInput.max,
			space = sliderInput.offsetWidth;

		sliderThumb.style.left = bulletPosition * space + 'px';
		sliderLine.style.width = sliderInput.value / sliderInput.max * 100 + '%';
	}

	/**
     * Handle Module Events
     */

	let volumeTimeout = null;
	let micMuteTimeout = null;
	let volMuteTimeout = null;

	function handleMicMute() {
		if (micMuteTimeout !== null) {
			clearTimeout(micMuteTimeout);
		}
		// Set a new timeout to revert the mute icon after 2 seconds
		const micMuteIcon = document.getElementById('micMute');
		if (micMuteIcon) {
			// First set icon to the intended outcome
			if (!isMicUnMuted) {
				micMuteIcon.classList.remove('fas', 'fa-microphone-slash');
				micMuteIcon.classList.add('fas', 'fa-microphone');
			} else {
				micMuteIcon.classList.remove('fas', 'fa-microphone');
				micMuteIcon.classList.add('fas', 'fa-microphone-slash');
			}
			// Then set mute icon to revert to current after 2 seconds if no change
			micMuteTimeout = setTimeout(() => {
				const micMuteIcon = document.getElementById('micMute');
				if (isMicUnMuted) {
					micMuteIcon.classList.remove('fas', 'fa-microphone-slash');
					micMuteIcon.classList.add('fas', 'fa-microphone');
				} else {
					micMuteIcon.classList.remove('fas', 'fa-microphone');
					micMuteIcon.classList.add('fas', 'fa-microphone-slash');
				}
			}, 2000);
		}

		sendSignal.sendDigitalSignal(digitalJoins.ControlBarMicMute, !isMicUnMuted);
	}

	function handleVolMute() {
		if (volMuteTimeout !== null) {
			clearTimeout(volMuteTimeout);
		}
		const volMuteIcon = document.getElementById('volMute');
		if (volMuteIcon) {
			if (!isVolUnMuted) {
				volMuteIcon.classList.remove('fas', 'fa-volume-xmark');
				volMuteIcon.classList.add('fas', 'fa-volume-up');
			} else {
				volMuteIcon.classList.remove('fas', 'fa-volume-up');
				volMuteIcon.classList.add('fas', 'fa-volume-xmark');
			}
			volMuteTimeout = setTimeout(() => {
				const volMuteIcon = document.getElementById('volMute');
				if (isVolUnMuted) {
					volMuteIcon.classList.remove('fas', 'fa-volume-xmark');
					volMuteIcon.classList.add('fas', 'fa-volume-up');
				} else {
					volMuteIcon.classList.remove('fas', 'fa-volume-up');
					volMuteIcon.classList.add('fas', 'fa-volume-xmark');
				}
			}, 2000);
		}
		sendSignal.sendDigitalSignal(digitalJoins.ControlBarVolumeMute, !isVolUnMuted);
	}

	function handleVolChange(event) {
		const volumeInput = event.target;
		if (!volumeInput) {
			return;
		}
		// TODO Return volume to old level after timer?
		if (volumeTimeout !== null) {
			clearTimeout(volumeTimeout);
		}
		// Set a new timeout to revert the volume after 2 seconds
		volumeTimeout = setTimeout(() => {
			volumeInput.value = volumeLevel;
			//console.log("Volume Reverted to Old Level:", volumeLevel);
			showSliderValue();
		}, 4000);

		const newVolume = volumeInput.value;
		//console.log("VolumeChange: ", newVolume);
		sendSignal.sendAnalogSignal(analogJoins.ControlBarVolume, newVolume);
	}

	function handleMicsMenu() {
		isMicsMenuOpen = !isMicsMenuOpen;

		sendSignal.sendDigitalSignal(digitalJoins.ControlBarMicMenu, isMicsMenuOpen);
		if (isMicsMenuOpen) {
			window.addEventListener('click', closeOutsideOverlay);
		} else {
			window.removeEventListener('click', closeOutsideOverlay);
		}
	}

	function closeOutsideOverlay(event) {
		//console.log("This happening?");
		if (event.target === overlay) {
			handleMicsMenu();
		}
	}

	/**
		 * Handle CrComLib Updates
		 */
	function updateMicMute(state) {
		if (micMuteTimeout !== null) {
			clearTimeout(micMuteTimeout);
		}
		isMicUnMuted = state;
		const micMuteIcon = document.getElementById('micMute');
		if (micMuteIcon) {
			if (isMicUnMuted) {
				micMuteIcon.classList.remove('fas', 'fa-microphone-slash');
				micMuteIcon.classList.add('fas', 'fa-microphone');
			} else {
				micMuteIcon.classList.remove('fas', 'fa-microphone');
				micMuteIcon.classList.add('fas', 'fa-microphone-slash');
			}
		} else {
			// TODO
			//console.error(`Mic Mute Button not yet available...`);
		}
	}

	function updateVolMute(state) {
		isVolUnMuted = state;
		const volMuteIcon = document.getElementById('volMute');
		if (volMuteIcon) {
			if (isVolUnMuted) {
				volMuteIcon.classList.remove('fas', 'fa-volume-xmark');
				volMuteIcon.classList.add('fas', 'fa-volume-up');
			} else {
				volMuteIcon.classList.remove('fas', 'fa-volume-up');
				volMuteIcon.classList.add('fas', 'fa-volume-xmark');
			}
		} else {
			//console.error(`Volume Mute Button not yet available...`);
		}
	}

	function updateVolume(value) {
		if (volumeTimeout !== null) {
			clearTimeout(volumeTimeout);
		}
		volumeLevel = value;

		const volumeBar = document.getElementById('volume');

		if (volumeBar) {
			volumeBar.value = volumeLevel;
			showSliderValue();
		} else {
			//console.error(`Volume Bar not yet available...`);
		}
	}

	/**
     * Initialise subscribers for Events from CrComLib
     */
	// This section contains code which handles the initialisation of Subscribers.
	const micMuteSubscribe = CrComLib.subscribeState('b', digitalJoins.ControlBarMicMuteFb, (state) => {
		console.log('Feedback CrComLib :::: Receiving Mic Mute Feedback :: State: ', state);
		updateMicMute(state);
	});

	const volMuteSubscribe = CrComLib.subscribeState('b', digitalJoins.ControlBarVolumeMuteFb, (state) => {
		console.log('Feedback CrComLib :::: Receiving Volume Mute Feedback :: State: ', state);
		updateVolMute(state);
	});

	const volumeSubscribe = CrComLib.subscribeState('n', analogJoins.ControlBarVolumeFb, (value) => {
		console.log('Feedback CrComLib :::: Receiving Volume Feedback :: Value: ', value);
		updateVolume(value);
	});

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:controlBar-import-widget', (value) => {
		if (value['loaded']) {
			onInit();
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:controlBar-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:control-bar-widget', (value) => {
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
				setupEvents();
				widgetInstances[value.id] = controlBarInstanceModule(value.id, value['elementIds']);
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
