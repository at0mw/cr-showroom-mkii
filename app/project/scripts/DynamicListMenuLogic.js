/*
    Need to pass in presets array of order num and html and handle rearranging here
*/
class DynamicListMenuLogic {
  constructor(htmlIdPrefix, itemsPerPage) {
    // Container for Module logic - Setup the custom instance of a list module
    this.dynamicListContainerId = htmlIdPrefix + "-dynamic-presets";
    this.dynamicListContainer = document.getElementById(
      this.dynamicListContainerId
    );
    this.itemsPerPage = itemsPerPage;

    // Create Identifiers for this instance
    this.dynamicMenuId = htmlIdPrefix + "-dynamic-menu";
    this.dynamicListButtonClass = htmlIdPrefix + "-dynamic-list";
    this.dynamicListButtonIdPrefix = htmlIdPrefix + "-dynamic-list-button:";
    this.editableButtonClass = htmlIdPrefix + "-editable-icons";
    this.backButtonId = htmlIdPrefix + "-back-button";
    this.forwardButtonId = htmlIdPrefix + "-forward-button";
    this.deleteIconIdPrefix = htmlIdPrefix + "-delete-icon:";

    // Setup Defaults
    this.currentPage = 1;
    this.presetsArray = null;
    this.dragging = false;
    this.activeButton = null;
    this.pressedButton = null;
    this.backTimer = null;
    this.forwardTimer = null;
    this.pressTimer = null;
    this.activeButton = null;
    this.dontPerformPress = false;

    // Initialise
    this.createDynamicPresets = this.createDynamicPresets.bind(this);
    this.generatePresetHTML = this.generatePresetHTML.bind(this);

    // Setup Dynamic Event Subscribers
    this.subscribeToEvents = this.subscribeToEvents.bind(this);
    this.unsubscribeToEvents = this.unsubscribeToEvents.bind(this);

    // Handle Events
    this.handleMousePress = this.handleMousePress.bind(this);
    this.handleTouchPress = this.handleTouchPress.bind(this);
    this.handleMousePressEnd = this.handleMousePressEnd.bind(this);
    this.handleTouchPressEnd = this.handleTouchPressEnd.bind(this);

    // Action Framework
    this.resetPressandInitiateHoldTimer =
      this.resetPressandInitiateHoldTimer.bind(this);
    this.checkPerformPressNeeded = this.checkPerformPressNeeded.bind(this);
    this.performPress = this.performPress.bind(this);
    this.releaseButton = this.releaseButton.bind(this);
    this.currentPageFirstItemIndex = this.currentPageFirstItemIndex.bind(this);
    this.extractNumberFromId = this.extractNumberFromId.bind(this);
    this.retrieveNewPageandInsertHtml =
      this.retrieveNewPageandInsertHtml.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.decrementPage = this.decrementPage.bind(this);
    this.moveBackwardPage = this.moveBackwardPage.bind(this);
    this.moveForwardPage = this.moveForwardPage.bind(this);
    this.revealMenuButtons = this.revealMenuButtons.bind(this);
    this.hideForwardButton = this.hideForwardButton.bind(this);
    this.hideBackwardButton = this.hideBackwardButton.bind(this);
    this.currentlyActiveMenuButtonsSwitch =
      this.currentlyActiveMenuButtonsSwitch.bind(this);

    // Action Updates
    this.presetSelected = this.presetSelected.bind(this);
    // On Preset Selected?
    this.trashIconSelected = this.trashIconSelected.bind(this);

    // Button Dragging
    this.initiateDragMode = this.initiateDragMode.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.trackDraggingUpdates = this.trackDraggingUpdates.bind(this);
    this.stopDrag = this.stopDrag.bind(this);

    // Dragging Framework
    this.moveButtonUp = this.moveButtonUp.bind(this);
    this.moveButtonDown = this.moveButtonDown.bind(this);
    this.clearTimersResetSpin = this.clearTimersResetSpin.bind(this);
    this.reorderHighlightedBack = this.reorderHighlightedBack.bind(this);
    this.reorderHighlightedForward = this.reorderHighlightedForward.bind(this);
    this.clickOutsideHandler = this.clickOutsideHandler.bind(this);

    // Toggle Default/Dragging Mode
    this.toggleActiveDragMode = this.toggleActiveDragMode.bind(this);
    this.toggleActiveDefaultMode = this.toggleActiveDefaultMode.bind(this);
    this.setActiveDraggingButton = this.setActiveDraggingButton.bind(this);
    this.unsetActiveDraggingButton = this.unsetActiveDraggingButton.bind(this);
    this.changeNavButtonsForDragging =
      this.changeNavButtonsForDragging.bind(this);
    this.changeNavButtonsForStopDragging =
      this.changeNavButtonsForStopDragging.bind(this);

    // Arrange Presets
    this.reorderListArray = this.reorderListArray.bind(this);
    this.sortPresetOrderByIndex = this.sortPresetOrderByIndex.bind(this);
    this.getPresetsForPage = this.getPresetsForPage.bind(this);

    // this.events = {
    //   listReorder: new Event("presetSelected"),
    // };

    window.addEventListener("subpageRearranging", this.releaseButton);
  }

  /* ================================== Handle Dynamic List Setup Start ================================== */

  /*
    Function to generate the HTML for presets from a template literal string
  */
  generatePresetHTML(presetsConfig) {
    return presetsConfig.map((preset) => ({
      id: this.dynamicListButtonIdPrefix + preset.id,
      order: preset.order,
      html: `<div class="list-button button ${this.dynamicListButtonClass}" id="${this.dynamicListButtonIdPrefix}${preset.id}" draggable="false">                    
                    <div class="list-button-text unclickable">${preset.label}</div>
                    <div class="label-icon-area unclickable ${this.editableButtonClass}">
                        <div class="list-button-icon delete-icon" id="${this.deleteIconIdPrefix}${preset.id}"><i class="fas fa-trash unclickable"></i></div>
                    </div>
                </div>`,
    }));
  }

  /*
    Create the dynamic presets array from the input config and then display the necessary presets given the page and number of items per page.
  */
  createDynamicPresets(presetsConfig) {
    // Generate an array of preset instances - each preset instance in the array has an id, order and html
    this.presetsArray = this.generatePresetHTML(presetsConfig);

    this.retrieveNewPageandInsertHtml();
    this.subscribeToEvents();
  }

  retrieveNewPageandInsertHtml(reorderMode, ignoredElementId) {
    //console.log("Retrieving new page: ", reorderMode, ignoredElementId);
    if (this.presetsArray && this.dynamicListContainer) {
      this.currentlyActiveMenuButtonsSwitch();

      const startIndex = this.currentPageFirstItemIndex();
      let numberOfPresetsToRetrieve = this.itemsPerPage;
      if (reorderMode) {
        //console.log("Reorder mode active...");
        numberOfPresetsToRetrieve--;
      }
      let presetsForPage = this.getPresetsForPage(
        startIndex,
        numberOfPresetsToRetrieve,
        ignoredElementId
      );
      if (reorderMode) {
        //console.log("Page Preset Html: ", presetsForPage);
      }
      this.dynamicListContainer.innerHTML = "";
      this.dynamicListContainer.insertAdjacentHTML("beforeend", presetsForPage);
    } else {
      console.error("Blank presets array or blank dynamic list container");
    }
  }

  currentlyActiveMenuButtonsSwitch() {
    const maxPage = Math.ceil(this.presetsArray.length / this.itemsPerPage);
    this.revealMenuButtons();
    if (this.currentPage == 1) {
      this.hideBackwardButton();
    } else if (maxPage == this.currentPage) {
      this.hideForwardButton();
    }
  }

  /* ================================== Handle Dynamic List Setup End ================================== */

  /* ================================== Handle Dynamic List Subscriptions Start ================================== */

  /*
    Subscribe to the dynamic events on the list buttons only.
  */
  subscribeToEvents() {
    this.unsubscribeToEvents();
    const movableButtons = document.querySelectorAll(
      "." + this.dynamicListButtonClass
    );
    // For each list button add listeners
    movableButtons.forEach((button) => {
      // Activate Press Timer
      button.addEventListener("mousedown", this.handleMousePress);
      button.addEventListener("touchstart", this.handleTouchPress);

      // Release and reset
      button.addEventListener("mouseup", this.handleMousePressEnd);
      button.addEventListener("touchend", this.handleTouchPressEnd);

      const trashIcon = button.querySelector(".delete-icon");
      if (trashIcon) {
        trashIcon.addEventListener("click", this.trashIconSelected);
        trashIcon.addEventListener("touchend", this.trashIconSelected);
      }
    });
  }

  /*
    Unsubscribe to the dynamic events on the list buttons only. Just to reset and clean up when a new preset config is needed for example.
  */
  unsubscribeToEvents() {
    const movableButtons = document.querySelectorAll(
      "." + this.dynamicListButtonClass
    );
    // For each list button add listeners
    movableButtons.forEach((button) => {
      // Activate Press Timer
      button.removeEventListener("mousedown", this.handleMousePress);
      button.removeEventListener("touchstart", this.handleTouchPress);

      // Release and reset
      button.removeEventListener("mouseup", this.handleMousePressEnd);
      button.removeEventListener("touchend", this.handleTouchPressEnd);

      const trashIcon = button.querySelector(".delete-icon");
      if (trashIcon) {
        trashIcon.removeEventListener("click", this.trashIconSelected);
        trashIcon.removeEventListener("touchend", this.trashIconSelected);
      }
    });
  }

  /* ================================== Handle Dynamic List Subscriptions End ================================== */

  /* ================================== Handle Dynamic List Default Action Framework Start ================================== */

  /*
    Handle a mouse press on a dynamic preset button.
  */
  handleMousePress(event) {
    //console.log("Intial List Button Press...");
    this.resetPressandInitiateHoldTimer(event);
  }

  /*
    Handle a touch screen press on a dynamic preset button.
  */
  handleTouchPress(event) {
    //console.log("Touch Start...");
    event.preventDefault();
    event.target.classList.add("touched");
    this.resetPressandInitiateHoldTimer(event);
  }

  /*
    Handle a mouse press release on a dynamic preset button.
  */
  handleMousePressEnd(event) {
    //console.log("End Mouse Press...");
    const button = event.target;
    //console.log("Pressed Button: ", button);
    this.checkPerformPressNeeded(button);
  }

  /*
    Handle a touch press release on a dynamic preset button.
  */
  handleTouchPressEnd(event) {
    //console.log("End Touch Press...");
    event.preventDefault();
    if (this.pressedButton) {
      this.pressedButton.classList.remove("touched");
    }

    // No press performed if hold timer triggered for example...
    const button = event.target;
    //console.log("Pressed Button: ", button);
    this.checkPerformPressNeeded(button);
  }

  /*
    Reset a press action and initiate a hold timer.
  */
  resetPressandInitiateHoldTimer(event) {
    this.dontPerformPress = false;
    if (!this.dragging) {
      let button = event.target;
      this.pressedButton = button;

      this.pressTimer = setTimeout(() => {
        this.dontPerformPress = true;
        this.initiateDragMode(button);
      }, 1500);
    }
  }

  /*
    Handle checks to identify if the press is to be ignored.
    @param {htmlElement} button - The button on which the press event was triggered.
  */
  checkPerformPressNeeded(button) {
    // If press occurs outside button being actively dragged, stop dragging and return to default state
    if (this.activeButton !== button || !this.activeButton.contains(button)) {
      this.stopDrag();
      clearTimeout(this.pressTimer);
      this.performPress(button);
    }
  }

  /*
    Perform a default press for the list button... To be ignored in edge cases such as page reshuffle before press end.
  */
  performPress(button) {
    //console.log("Perform Press...");
    if (!this.dontPerformPress) {
      this.presetSelected(button);
    }
    // Reset for next click
    this.dontPerformPress = false;
  }

  /*
    This releases a button potentially before mouse/touch end triggered and therefore signifies the next press end should be ignored until after
    next press initiate.
  */
  releaseButton() {
    //console.log("Release Pressed Button...");
    if (this.pressedButton) {
      this.pressedButton.classList.remove("touched");
    }
    this.dontPerformPress = true;
    clearTimeout(this.pressTimer);
  }

  /*
    @returns {number} Returns the index of the first item in a list on the current page. Indexed in base 0.
  */
  currentPageFirstItemIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  /*
    @returns {number} Extracts the second part of the id, which should be formatted as stringName:idNumber.
  */
  extractNumberFromId(id) {
    //console.log("Id to be extracted: ", id);
    const parts = id.split(":");
    if (parts.length === 2 && !isNaN(parts[1])) {
      return parts[1];
    }
    return null;
  }

  /*
    Decrement the current page if possible and then recreate dynamic presets.
  */
  decrementPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /*
    Handle decrementing page and page change.
  */
  moveBackwardPage() {
    this.decrementPage();
    this.retrieveNewPageandInsertHtml();
    this.subscribeToEvents();
  }

  /*
    Increment the current page if possible and then recreate dynamic presets.
  */
  incrementPage() {
    const maxPage = Math.ceil(this.presetsArray.length / this.itemsPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage++;
    }
  }

  /*
    Handle incrementing page and page change.
  */
  moveForwardPage() {
    this.incrementPage();
    this.retrieveNewPageandInsertHtml();
    this.subscribeToEvents();
  }

  revealMenuButtons() {
    const forwardButton = document.getElementById(this.forwardButtonId);
    const backButton = document.getElementById(this.backButtonId);
    if (forwardButton && backButton) {
      forwardButton.style.opacity = "1";
      backButton.style.opacity = "1";
    }
  }

  hideForwardButton() {
    const forwardButton = document.getElementById(this.forwardButtonId);

    if (forwardButton) {
      forwardButton.style.opacity = "0";
    }
  }

  hideBackwardButton() {
    const backButton = document.getElementById(this.backButtonId);
    if (backButton) {
      backButton.style.opacity = "0";
    }
  }

  /* ================================== Handle Dynamic List Default Action Framework End ================================== */

  /* ================================== Handle Dynamic List Default Action Updates Start ================================== */

  /*
    This method is used to notify that a preset has been selected.
  */
  presetSelected(button) {
    //console.log("Button Selected: ", button.id);
    const buttonNumber = this.extractNumberFromId(button.id);
    if (buttonNumber) {
      const event = new CustomEvent("presetSelected", {
        detail: {
          presetId: buttonNumber,
        },
      });
      this.dynamicListContainer.dispatchEvent(event);
    }
  }

    /*
    This method is used to notify that a preset has been selected.
  */
  listReordered(presetId, insertIndex) {
    //console.log("HERE WE ARE");
    const presetIdNum = this.extractNumberFromId(presetId);
    if (presetIdNum) {
      const event = new CustomEvent("presetReordered", {
        detail: {
          presetId: presetIdNum,
          newOrder: insertIndex + 1 // 1 based order on backend
        },
      });
      this.dynamicListContainer.dispatchEvent(event);
    }
  }

  onPresetSelected(event, callback) {
    this.dynamicListContainer.addEventListener(event, callback);
  }

  /*
    This method is used to notify that a preset has been selected for deletion.
  */
  trashIconSelected(event) {
    event.stopPropagation();
    const presetId = event.target.id;
    //console.log("Trash Icon Selected...")
    const presetIdNum = this.extractNumberFromId(presetId);
    if(presetIdNum) {
      const event = new CustomEvent("presetDeleted", {
        detail: {
          presetId: presetIdNum,
        },
      });
      this.dynamicListContainer.dispatchEvent(event);
    }
  }

  /* ================================== Handle Dynamic List Default Action Updates End ================================== */

  /* ================================== Handle Button Dragging to Rearrange ================================== */

  initiateDragMode(button) {
    //console.log("Start Dragging...");
    this.dragging = true;
    this.toggleActiveDragMode(button);

    document.addEventListener("mousedown", this.clickOutsideHandler);
    document.addEventListener("touchstart", this.clickOutsideHandler);
  }

  handleDrag(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.activeButton) {
      this.trackDraggingUpdates(event);
    }
  }

  trackDraggingUpdates(e) {
    //console.log("Dragging updates...");
    const isTouchEvent = e.type === "touchmove";
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    const targetButton = document.elementFromPoint(clientX, clientY);
    const dynamicMenu = document.getElementById(this.dynamicMenuId);

    if (targetButton && dynamicMenu && dynamicMenu.contains(targetButton)) {
      //console.log("Dragging updates...", targetButton.id);
      if (
        targetButton.classList.contains("list-button") &&
        targetButton !== this.activeButton
      ) {
        // Clear back and forward timer
        this.clearTimersResetSpin();

        const targetRect = targetButton.getBoundingClientRect();
        const targetY = isTouchEvent
          ? targetRect.top + window.scrollY
          : targetRect.top;
        const threshold = targetY + targetRect.height / 4; // Adjust the threshold as needed

        if (clientY < threshold) {
          this.moveButtonUp(targetButton);
        } else {
          this.moveButtonDown(targetButton);
        }
      } else {
        this.clearTimersResetSpin();
      }
    } else {
      if (targetButton.id === this.backButtonId) {
        if (this.forwardTimer) {
          this.forwardTimer = null;
        }
        if (!this.backTimer) {
          // Start a new timer when the button is dragged over the back button
          this.backTimer = setTimeout(() => {
            if (this.backTimer) {
              clearTimeout(this.backTimer);
              // Trigger Move Back List
              this.reorderHighlightedBack();
            }
          }, 1000);
        }
      } else if (targetButton.id === this.forwardButtonId) {
        if (this.backTimer) {
          this.backTimer = null;
        }
        if (!this.forwardTimer) {
          // Start a new timer when the button is dragged over the forward button
          this.forwardTimer = setTimeout(() => {
            if (this.forwardTimer) {
              clearTimeout(this.forwardTimer);
              // Trigger Move Forward List
              this.reorderHighlightedForward();
            }
          }, 1000);
        }
      }
    }
  }

  stopDrag() {
    this.dragging = false;
    if (this.activeButton !== null) {
      const lastActiveButtonId = this.activeButton.id;

      this.reorderListArray(lastActiveButtonId);
      this.toggleActiveDefaultMode();

      this.sortPresetOrderByIndex();
      this.retrieveNewPageandInsertHtml();
      this.subscribeToEvents();
      //console.log("Detaching event listeners...")
      document.removeEventListener("mousedown", this.clickOutsideHandler);
      document.removeEventListener("touchstart", this.clickOutsideHandler);
    }
  }

  /* ================================= Handle Button Dragging End ================================= */

  /* ================================== Handle Dynamic List Dragging Action Framework Start ================================== */

  /*
    This function will move the active/dragging button above the targeted button beneath press/mouse
  */
  moveButtonUp(targetButton) {
    this.activeButton.parentNode.insertBefore(this.activeButton, targetButton);
  }

  /*
    This function will move the active/dragging button below the targeted button beneath press/mouse
  */
  moveButtonDown(targetButton) {
    if (targetButton.nextSibling) {
      targetButton.parentNode.insertBefore(
        this.activeButton,
        targetButton.nextSibling
      );
    } else {
      targetButton.parentNode.appendChild(this.activeButton);
    }
  }

  /*
    This function clears the forward and backwards timers which are triggered when a button is dragged into the appropriate area.
  */
  clearTimersResetSpin() {
    if (this.forwardTimer) {
      this.forwardTimer = null;
    }
    if (this.backTimer) {
      this.backTimer = null;
    }
  }

  /*
    This will trigger when a click occurs outside the active button, this ending the dragging mode and toggling default.
  */
  clickOutsideHandler(e, button) {
    if (this.activeButton && !this.activeButton.contains(e.target)) {
      this.stopDrag(button);
    }
  }

  /*
    This will trigger when a button is dragged to the specified area which enables reordering the item to the previous page.
  */
  reorderHighlightedBack() {
    //console.log("Moving backwards?");
    this.decrementPage();
    this.retrieveNewPageandInsertHtml(true, this.activeButton.id);
    //this.subscribeToEvents();
  }

  /*
    This will trigger when a button is dragged to the specified area which enables reordering the item to the next page.        
  */
  reorderHighlightedForward() {
    //console.log("Moving forwards?");
    this.incrementPage();
    this.retrieveNewPageandInsertHtml(true, this.activeButton.id);
    //this.subscribeToEvents();
  }

  /* ================================== Handle Dynamic List Dragging Action Framework End ================================== */

  /* ================================== Toggle List Button Default/Drag Mode Start ================================== */

  toggleActiveDragMode(button) {
    if (this.activeButton) {
      this.toggleActiveDefaultMode();
    }
    this.setActiveDraggingButton(button);
    this.changeNavButtonsForDragging();
  }

  toggleActiveDefaultMode() {
    this.unsetActiveDraggingButton();
    this.changeNavButtonsForStopDragging();
  }

  setActiveDraggingButton(button) {
    const iconArea = button.querySelector("." + this.editableButtonClass);
    if (iconArea) {
      iconArea.style.display = "flex";
    }
    button.draggable = true;
    button.classList.add("highlighted", "wiggle");
    this.activeButton = button;

    button.addEventListener("touchmove", this.handleDrag);
    button.addEventListener("drag", this.handleDrag);
  }

  unsetActiveDraggingButton() {
    if (this.activeButton) {
      const iconArea = this.activeButton.querySelector(
        this.editableButtonClass
      );
      if (iconArea) {
        iconArea.style.display = "none";
      }
      this.activeButton.draggable = false;
      this.activeButton.classList.remove("highlighted", "wiggle");

      // Detach drag event listeners...
      this.activeButton.removeEventListener("touchmove", this.handleDrag);
      this.activeButton.removeEventListener("drag", this.handleDrag);
      this.activeButton = null;
    }
  }

  changeNavButtonsForDragging() {
    //console.log("Changing Nav Buttons");
    const backButton = document.getElementById(this.backButtonId);
    const forwardButton = document.getElementById(this.forwardButtonId);

    const backButtonChildDiv = backButton.querySelector(".menu-button-text");
    backButtonChildDiv.textContent = "Drag Here";

    const forwardButtonChildDiv =
      forwardButton.querySelector(".menu-button-text");
    forwardButtonChildDiv.textContent = "Drag Here";
  }

  changeNavButtonsForStopDragging() {
    const backButton = document.getElementById(this.backButtonId);
    const forwardButton = document.getElementById(this.forwardButtonId);
    const backButtonChildDiv = backButton.querySelector(".menu-button-text");
    backButtonChildDiv.textContent = "";

    const forwardButtonChildDiv =
      forwardButton.querySelector(".menu-button-text");
    forwardButtonChildDiv.textContent = "";
  }

  /* ================================== Toggle List Button Default/Drag Mode End ================================== */

  /* ================================== Handle Arrange Presets ================================== */

  reorderListArray(lastActiveButtonId) {
    const lastActiveButtonListIndex = this.presetsArray.findIndex(
      (preset) => preset.id === lastActiveButtonId
    );
    //console.log("Active Buttons Last Index Position: ", lastActiveButtonListIndex);

    const movableButtons = document.querySelectorAll(
      "." + this.dynamicListButtonClass
    );
    let insertIndex = -1; // Target Index I wish to insert item at

    movableButtons.forEach((button, index) => {
      //console.log("Button Id ", button.id, " index ", index);
      let currentButtonPresetIndex = this.presetsArray.findIndex(
        (preset) => preset.id === button.id
      );

      if (button.id === lastActiveButtonId) {
        //console.log("Matched ", index);
        insertIndex = this.currentPageFirstItemIndex() + index;
        if (insertIndex === currentButtonPresetIndex) {
          // Do nothing button hasn't moved
          insertIndex = -1;
        }
      }
    });

    // If insert index is -1, do nothing. Otherwise reposition
    if (insertIndex !== -1) {
      // Get the old active button
      //console.log("Insert Index:  ", insertIndex);
      let lastActiveButton = this.presetsArray.find(
        (preset) => preset.id === lastActiveButtonId
      );

      if (lastActiveButtonListIndex !== undefined) {
        //console.log("Remove");
        this.presetsArray.splice(lastActiveButtonListIndex, 1);
        //console.log("Removed", this.presetsArray);
        this.presetsArray.splice(insertIndex, 0, lastActiveButton);
      }

      this.listReordered(lastActiveButtonId, insertIndex)
    }
  }

  /*
    This method sorts the data-order for each button to be equivalent to its index position in the
    presetsArray.
  */
  sortPresetOrderByIndex() {
    this.presetsArray.forEach((button, index) => {
      button.order = index + 1;
    });
  }

  /*
      This method returns the preset html strings for the presets in within the index positions given.
      @param {startIndex} pageOffset - This value indicates that the presets need to drop the first or last value (-1 or +1 respectively)
      @param {number} itemsPerPage - The number of items per page.
      @returns {string} The HTML strings for the presets on the specified page concatenated.
    */
  getPresetsForPage(startIndex, itemsPerPage, dontIncludeId) {
    //console.log("Presets for page :: Dont Include: ", dontIncludeId);
    let presetsArrayTempCopy = [...this.presetsArray];
    if (dontIncludeId) {
      presetsArrayTempCopy = presetsArrayTempCopy.filter(
        (preset) => preset.id !== dontIncludeId
      );
    } 

    const endIndex = startIndex + itemsPerPage;
    presetsArrayTempCopy = presetsArrayTempCopy.sort(
      (a, b) => a.order - b.order
    );
    if(dontIncludeId) {
      //console.log("Temp Filtered Presets: ", presetsArrayTempCopy);
    }
    // Extract only the HTML strings from presetsDictionary
    const htmlStrings = presetsArrayTempCopy
      .slice(startIndex, endIndex)
      .map((preset) => preset.html)
      .join("");

    return htmlStrings;
  }

  /* ================================= Handle Arrange Presets End ================================= */
}
