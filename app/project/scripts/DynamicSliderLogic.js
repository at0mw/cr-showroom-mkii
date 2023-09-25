/*
    Class script to setup and link slider logic
*/

class DynamicSliderLogic {
    constructor(htmlIdPrefix) {
        // Setup Defaults and Distinct Prefix   
        this.htmlIdPrefix = htmlIdPrefix;
        this.thumbDisappearTimeout;
        this.sliderContainer = document.getElementById(this.htmlIdPrefix + '-dynamic-inputs');

        // Bind Methods for creation
        this.createDynamicSliders = this.createDynamicSliders.bind(this);
        this.subscribeToEvents = this.subscribeToEvents.bind(this);
        this.unsubscribeToEvents = this.unsubscribeToEvents.bind(this);

        // Bind Methods for event handling
        this.resizeAllSliderVisuals = this.resizeAllSliderVisuals.bind(this);
        this.resizeSliderArea = this.resizeSliderArea.bind(this);
        this.resizeSliderVisuals = this.resizeSliderVisuals.bind(this);
        this.updateSliderVisuals = this.updateSliderVisuals.bind(this);
        this.updateSlider = this.updateSlider.bind(this);
        this.handleSliderDownClick = this.handleSliderDownClick.bind(this);
        this.handleSliderUpClick = this.handleSliderUpClick.bind(this);

        // Bind Methods for feedback handling
        this.updateSliderLevel = this.updateSliderLevel.bind(this);
        this.changeThumbVisibility = this.changeThumbVisibility.bind(this);
        this.changeSliderVisuals = this.changeSliderVisuals.bind(this);

        // Create Events for slider value update
        this.events = {
            sliderValueUpdateEvent: new Event('sliderValueUpdate'),
          };

    }

    // Setup Subscriptions
    subscribeToEvents() {
        //console.log("Subscribing to Events in Dynamic Slider Logic...");
        window.addEventListener("resize", this.resizeAllSliderVisuals);

        // Setup listeners for all sliders
        const allSliders = document.querySelectorAll('.' + this.htmlIdPrefix + '-range-slider_input');
        allSliders.forEach((slider) => {
            slider.addEventListener('input', this.updateSliderVisuals);
            slider.addEventListener('change', this.updateSlider);
            //this.watchForSliderContainerResize(slider);
        });

        const allSliderDownButtons = document.querySelectorAll('.' + this.htmlIdPrefix + '-down-action');
        allSliderDownButtons.forEach((button) => {
            button.addEventListener('click', this.handleSliderDownClick);
        });
    
        const allSliderUpButtons = document.querySelectorAll('.' + this.htmlIdPrefix + '-up-action');
        allSliderUpButtons.forEach((button) => {
            button.addEventListener('click', this.handleSliderUpClick);
        });
    }

    // Remove Subscriptions
    unsubscribeToEvents() {
        window.removeEventListener("resize", this.resizeAllSliderVisuals);

        // Setup listeners for all sliders
        const allSliders = document.querySelectorAll('.' + this.htmlIdPrefix + '-range-slider_input');
        allSliders.forEach((slider) => {
            slider.removeEventListener('input', this.updateSliderVisuals);
            slider.removeEventListener('change', this.updateSlider)
        });

        const allSliderDownButtons = document.querySelectorAll('.' + this.htmlIdPrefix + '-down-action');
        allSliderDownButtons.forEach((button) => {
            button.removeEventListener('click', this.handleSliderDownClick);
        });
    
        const allSliderUpButtons = document.querySelectorAll('.' + this.htmlIdPrefix + '-up-action');
        allSliderUpButtons.forEach((button) => {
            button.removeEventListener('click', this.handleSliderUpClick);
        });
    }

    /*
        Handle the creation of the dynamic sliders
    */
    createDynamicSliders(slidersArray){
        //console.log("Creating Dynamic Sliders: ", slidersArray);
        this.unsubscribeToEvents();
        if(!this.sliderContainer) {
            this.sliderContainer = document.getElementById(this.htmlIdPrefix + '-dynamic-inputs');
        }
        // <div class="ui-element-text ignore-swipe">${slider.label}</div>
        if(this.sliderContainer) {
            this.sliderContainer.innerHTML = '';
            slidersArray.forEach(slider => {  
                const sliderHtml = `
                    <div class="slider-input-area">
                        <div class="icon-circle">
                            <i class="fa-regular fa-caret-left shade-arrow ${this.htmlIdPrefix}-down-action" id="${this.htmlIdPrefix}-down:${slider.id}"></i>
                        </div>
                        <div class="range-slider">
                            <div id="${this.htmlIdPrefix}-thumb:${slider.id}" class="${this.htmlIdPrefix}-range-slider_thumb shade-slider-thumb range-slider_thumb  slider-scalable">
                                <div class="thumb-text rotate-forward-90"></div>
                            </div>
                            <div class="range-slider_line">
                                <div id="${this.htmlIdPrefix}-line:${slider.id}" class="${this.htmlIdPrefix}-range-slider_line-fill range-slider_line-fill"></div>
                            </div>
                            <input id="${this.htmlIdPrefix}-input:${slider.id}" class="${this.htmlIdPrefix}-range-slider_input range-slider_input" type="range" value="0" min="0" max="100">
                        </div>                        
                        <div class="icon-circle">
                            <i class="fa-regular fa-caret-right shade-arrow ${this.htmlIdPrefix}-up-action" id="${this.htmlIdPrefix}-up:${slider.id}"></i>
                        </div>
                    </div>`;

                    // Replace all old html in container
                    this.sliderContainer.insertAdjacentHTML('beforeend', sliderHtml);                 
            });
        } else {
            console.error("Slider container html is missing?");
        }
        this.subscribeToEvents();   
    }

    /*
        Event function to catch when slider value changes.
    */    
    updateSlider(event) {
        const sliderId = event.target.id.split(':')[1];
        const slider_input = document.getElementById(this.htmlIdPrefix +'-input:'+ sliderId);
        
        this.sendSliderLevelUpdate(sliderId, slider_input.value);
    }

    /*
        Event function to catch when arrow down is pressed for a slider
    */  
    handleSliderDownClick(event) {
        const shadeId = event.target.id.split(':')[1];
        const slider_input = document.getElementById(this.htmlIdPrefix +'-input:'+ shadeId);
        slider_input.value = parseInt(slider_input.value) - 1;

        // Needs to go back end and then in through feedback for visual update
        this.sendSliderLevelUpdate(shadeId, slider_input.value);
    }
    
    // Event handler for shade-up button click
    handleSliderUpClick(event) {
        const shadeId = event.target.id.split(':')[1]; 
        const slider_input = document.getElementById(this.htmlIdPrefix +'-input:'+ shadeId);
        slider_input.value = parseInt(slider_input.value) + 1;

        // Needs to go back end and then in through feedback for visual update
        this.sendSliderLevelUpdate(shadeId, slider_input.value);
    }

    updateSliderVisuals(event) {
        const shadeId = event.target.id.split(':')[1];
        this.resizeSliderVisuals(shadeId, true);
    }

    resizeSliderVisuals(shadeId, showThumb) {        
        //const shadeId = extractNumberFromId(event.target.id);
        if(shadeId) {
            this.hideAllSliderThumbs();
            //console.log("Slider Id Update Value: ", shadeId);
            const slider_input = document.getElementById(this.htmlIdPrefix +'-input:'+ shadeId);
            const slider_thumb = document.getElementById(this.htmlIdPrefix +'-thumb:'+ shadeId);
            const slider_line = document.getElementById(this.htmlIdPrefix +'-line:'+ shadeId);
            
            if(showThumb) {
                if(slider_thumb) {
                    this.changeThumbVisibility(slider_thumb);
                }
            } 


            if(slider_input && slider_thumb && slider_line) {
                this.changeSliderVisuals( slider_input, slider_thumb, slider_line);
            }
        }
    }

    changeSliderVisuals(sliderInput,sliderThumb, sliderLine) {
        let thumb_text = sliderThumb.querySelector('.thumb-text');
        thumb_text.innerHTML = sliderInput.value;
        const bulletPosition = (sliderInput.value /sliderInput.max),
                space = sliderInput.offsetWidth; //- slider_thumb.offsetWidth;
                sliderThumb.style.left = (bulletPosition * space) + 'px';
                sliderLine.style.width = sliderInput.value + '%';
    }

    changeThumbVisibility(sliderThumb) {   
        let thumbText = sliderThumb.querySelector('.thumb-text'); 
        thumbText.style.opacity = 1;
        if (this.thumbDisappearTimeout) {
            clearTimeout(this.thumbDisappearTimeout);
        }
        sliderThumb.classList.add('active');
        sliderThumb.style.opacity = '1';

        // Set a new timeout to make the thumb disappear after 2 seconds
        this.thumbDisappearTimeout = setTimeout(() => {
            thumbText.style.opacity = 0;
            sliderThumb.classList.remove('active');
        }, 1500);
    }

    hideAllSliderThumbs() {
        const allSliderAreas = document.querySelectorAll('.'+this.htmlIdPrefix+'-slider-thumb');
        allSliderAreas.forEach(this.hideSliderThumb);        
    }

    hideSliderThumb(sliderThumb) {
        sliderThumb.classList.remove('active');
        let thumbText = sliderThumb.querySelector('.thumb-text'); 
        thumbText.style.opacity = 0;
    }

    resizeAllSliderVisuals(){
        //console.log("Resize all sliders...");
        const allSliderAreas = document.querySelectorAll('.slider-input-area');
        allSliderAreas.forEach(this.resizeSliderArea);
    }

    resizeSliderArea(sliderArea) {
        //console.log("Resizing Slider Area....")
        const sliderInput = sliderArea.querySelector('.'+this.htmlIdPrefix+'-range-slider_input');
        const sliderThumb = sliderArea.querySelector('.'+this.htmlIdPrefix+'-range-slider_thumb');
        const sliderLine = sliderArea.querySelector('.'+this.htmlIdPrefix+'-range-slider_line-fill');
    
        if (sliderInput && sliderThumb && sliderLine) {
            //sliderThumb.innerHTML = sliderInput.value;
            const bulletPosition = (sliderInput.value / sliderInput.max);
            const space = sliderInput.offsetWidth; //- sliderThumb.offsetWidth;
    
            sliderThumb.style.left = (bulletPosition * space) + 'px';
            sliderLine.style.width = sliderInput.value / sliderInput.max * 100 + '%';
        }
    }

    /*
       This function sends an updated Shade Value to the Server.
       @param {number} shadeIdNum - The ID of the shade to be update. (Use 0 for global)
       @param {number} sliderValueNum - The percentage the shade will be opened 100% for open and 0 for closed.
    */
    sendSliderLevelUpdate(shadeId, sliderValue) {
        const shadeIdNum = parseInt(shadeId);
        const sliderValueNum = parseInt(sliderValue);
        let shadeLevelJson = {
            id: shadeIdNum,
            shadevalue: sliderValueNum
        }
        const shadeLevelJsonString = JSON.stringify(shadeLevelJson);
        const event = new CustomEvent('sliderValueUpdate', {
            detail: {
                sliderUpdateMessage: shadeLevelJsonString
            }
        });
        this.sliderContainer.dispatchEvent(event);
    }

    onSliderUpdate(event, callback) {
        if(this.sliderContainer){
            this.sliderContainer.addEventListener(event, callback);
        }
      }

    updateSliderLevel(shadeIdNum, newValue) {
        // Handle in slider manager
        const potentialSliderId = this.htmlIdPrefix + '-input:' + shadeIdNum;
        
        const slider = document.getElementById(potentialSliderId);

        if(slider) {
            // Get the current value
            const currentValue = parseInt(slider.value, 10);
            if (!isNaN(currentValue) && currentValue !== newValue) {
                // Make sure we dont go below but we also adjust to nearest possible
                if(newValue < parseInt(slider.min, 10)){
                    newValue = 0;
                }
                if(newValue > parseInt(slider.max, 10)){
                    newValue = 100;
                }
                // Send to slider
                slider.value = newValue;
                //slider.dispatchEvent(new Event('input')); // Do we need to send, does it do anything?
            }
            this.resizeSliderVisuals(shadeIdNum);
        }
    }
}