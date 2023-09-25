const surfaceMenuInstanceModule = (id, elementIds) => {
	'use strict';
	const instance = document.getElementById(elementIds[0]);

	// Your code for when widget instance removed from DOM here
	const cleanup = () => {
		// console.log(`surfaceMenu-widget surfaceMenuInstanceModule cleanup("${id}")`);
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

const surfaceMenuModule = (() => {
	'use strict';
	const widgetInstances = {};

	function onInit() {
		// serviceModule.addEmulatorScenarioNoControlSystem(
		// 	'./app/project/components/widgets/surface-menu/surface-menu-emulator.json'
		// );
		// Uncomment the below line and comment the above to load the emulator all the time.
		serviceModule.addEmulatorScenario('./app/project/components/widgets/main-surface/surface-menu/surface-menu-emulator.json');
	}

	let selectedSurface;
	function onCreated(dynamicSurfaceContainer) {
		const surfaces = dynamicSurfaceContainer.querySelectorAll('.surface');

		surfaces.forEach((surface) => {
			if (surface.classList.contains('expanded')) {
				//console.log("Found an expanded page!");
				selectedSurface = surface;
			}

			surface.addEventListener('click', handleSurfaceTouch);
		});
	}

	function handleSurfaceTouch() {
		const surfaces = document.querySelectorAll('.surface');
		if (this.classList.contains('expanded')) {
			return; // Ignore the click on an already expanded surface
		}
		surfaces.forEach((b) => {
			b.classList.remove('expanded', 'selected');
			// b.classList.add("surface-shape");
			b.querySelector('.surface-card').style.opacity = 0; // Hide the card on contract
		});

		this.classList.add('expanded', 'selected');
		//this.classList.remove("surface-shape"); // Considered a more open design when the card expands
		this.querySelector('.surface-card').style.opacity = 1; // Show the card on expand
		selectedSurface = this;

		const customEvent = new Event('surfaceRearranging');
		window.dispatchEvent(customEvent);
	}

	let touchStartX;
	let touchEndX;

	// Minimum distance for a swipe to be considered a swipe
	const minSwipeDistance = 150; // Adjust this value as needed

	// Flag to indicate if a swipe is in progress
	let isSwipeInProgress = false;
	function denySwipe(element) {
		const isSliderInput = element.tagName.toLowerCase() === 'input' && element.type === 'range';
		const isRangeArea = element.classList.contains('ignore-swipe');

		const isWithinDisplayFan = element.closest('.surface-menu-widget') !== null;
		// Return false if any of the conditions are met
		return isRangeArea || isSliderInput || !isWithinDisplayFan; //|| isListButton ||
	}

	// Function to handle touch start event
	function handleTouchStart(event) {
		const targetElement = event.target;

		// Check if the touch starts on a draggable element or slider input
		if (denySwipe(targetElement)) {
			return;
		}

		touchStartX = event.touches[0].clientX;
		isSwipeInProgress = true;
	}

	// Function to handle touch move event
	function handleTouchMove(event) {
		if (!isSwipeInProgress) {
			return;
		}

		touchEndX = event.touches[0].clientX;
		const swipeDistance = touchEndX - touchStartX;

		if (Math.abs(swipeDistance) > minSwipeDistance) {
			touchStartX = touchEndX;
			if (swipeDistance > 0) {
				selectPrevioussurface();
			} else {
				selectNextsurface();
			}
		}
	}

	// Function to select the previous surface
	function selectPrevioussurface() {
		//console.log("Looking for previous expandable surface");
		if (!selectedSurface) {
			selectedSurface = document.querySelector('.selected');
		}

		if (selectedSurface) {
			const previousSurface = selectedSurface.previousElementSibling;

			if (previousSurface) {
				const customEvent = new Event('surfaceRearranging');
				window.dispatchEvent(customEvent);
				selectedSurface.querySelector('.surface-card').style.opacity = 0;
				selectedSurface.classList.remove('expanded', 'selected');
				previousSurface.classList.add('expanded', 'selected');
				previousSurface.querySelector('.surface-card').style.opacity = 1;
				selectedSurface = previousSurface;
			}
		}
	}

	// Function to select the next surface
	function selectNextsurface() {
		//console.log("Looking for next expandable surface");
		if (!selectedSurface) {
			selectedSurface = document.querySelector('.selected');
		}

		if (selectedSurface) {
			const nextSurface = selectedSurface.nextElementSibling;
			if (nextSurface) {
				const customEvent = new Event('surfaceRearranging');
				window.dispatchEvent(customEvent);
				selectedSurface.querySelector('.surface-card').style.opacity = 0;
				selectedSurface.classList.remove('expanded', 'selected');
				nextSurface.classList.add('expanded', 'selected');
				nextSurface.querySelector('.surface-card').style.opacity = 1;
				selectedSurface = nextSurface;
			}
		}
	}

	function handleTouchEnd() {
		isSwipeInProgress = false;
	}

	// Add event listeners for touch events
	window.addEventListener('touchstart', handleTouchStart);
	window.addEventListener('touchmove', handleTouchMove);
	window.addEventListener('touchend', handleTouchEnd);

	function createSurfaceMenu(surfaceConfig) {
		//console.log('Time to create surface menu!');
		let concatentateSurfaceHtml = '';
		const dynamicSurfaceContainer = document.getElementById('dynamic-surface-container');

		if (dynamicSurfaceContainer) {
			surfaceConfig.forEach((surface) => {
				let surfaceHTML = createSurfaceElement(surface);
				concatentateSurfaceHtml = concatentateSurfaceHtml + surfaceHTML;
			});
			dynamicSurfaceContainer.innerHTML = '';
			dynamicSurfaceContainer.insertAdjacentHTML('beforeend', concatentateSurfaceHtml);

			checkForActive(dynamicSurfaceContainer);
		}
		onCreated(dynamicSurfaceContainer);
	}

	let activeSurface = 'surface:1';
	function checkForActive(dynamicSurfaceContainer) {
		const surfaces = dynamicSurfaceContainer.children;
		if (!surfaces) return;

		for (let i = 0; i < surfaces.length; i++) {
			const surface = surfaces[i];
			if (surface.id === activeSurface) {
				surface.classList.add('expanded');
				surface.classList.add('selected');
			} else {
				surface.classList.remove('expanded');
				surface.classList.remove('selected');
			}
		}
	}

	function createSurfaceElement(obj) {
		return `
            <div class="surface" id="surface:${obj.id}">
                <div class="surface-card">
                    <div class="content-area">
						<ch5-template templateid="${obj.templateId}"></ch5-template>
					</div>					
                </div>
                <div class="experiment">
                    <div class="surface-icon">
                        <i class="${obj.icon}"></i>
                    </div>
                </div>
            </div>
        `;
	}

	function isValidJsonList(jsonList) {
		if (!Array.isArray(jsonList)) {
			return false; // Not an array
		}

		for (const obj of jsonList) {
			// Check if each object in the list has the required properties and their types are as expected
			if (
				!(
					obj &&
					typeof obj === 'object' &&
					'id' in obj &&
					typeof obj.id === 'number' &&
					'icon' in obj &&
					typeof obj.icon === 'string'
				)
			) {
				return false;
			}
		}

		return true;
	}

	function parseSurfaceConfigJson(receivedConfig) {
		const jsonList = JSON.parse(receivedConfig);
		if (isValidJsonList(jsonList)) {
			console.log('Valid Json Config');
			return jsonList;
		}
		return null;
	}

	const sourceSubscription = CrComLib.subscribeState('s', serialJoins.SurfaceConfigMessage, (receivedConfig) => {
		console.log('Feedback CrComLib :::: Surface Menu ::: Receiving Surface Config :: Value: ', receivedConfig);
		//.updateSourceSelected(receivedConfig);
		if (!receivedConfig) return;

		const validatedConfig = parseSurfaceConfigJson(receivedConfig);
		if (validatedConfig) {
			createSurfaceMenu(validatedConfig);
		} else {
			console.error('Received invalid config for Surface Menu!');
		}
	});

	/**
     * private method for widget class creation
     */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:surfaceMenu-import-widget', (value) => {
		//console.log("Surface menu widget created now!");
		if (value['loaded']) {
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:surfaceMenu-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	/**
     * private method for widget instance addition and removal
     */
	CrComLib.subscribeState('o', 'ch5-template:surface-menu-widget', (value) => {
		//console.log("Surface menu widget loaded/removed now!");
		if (value['loaded'] !== undefined && value['id'] !== undefined) {
			if (value.loaded) {
				onInit();
				widgetInstances[value.id] = surfaceMenuInstanceModule(value.id, value['elementIds']);
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
