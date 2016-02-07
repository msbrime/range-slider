var RangeSlider = (function () {

    /**
     * The extend helper function
     * 
     * Helper function to merge multiple
     * objects into a single object
     * 
     * @return Object
     */
    function extend() {
        var base = Array.prototype.shift.call(arguments);

        for (var i = 0; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    base[key] = arguments[i][key];
                }
            }
        }
        return base;
    }

    /**
     * Debouncing function courtesy of David Walsh
     * 
     * https://davidwalsh.name/javascript-debounce-function
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Helper to calculate the actual position
     * of a DOM Element
     * 
     * Helper function to calculate the actual
     * position of elements with respect to the 
     * DOM Window
     * 
     * @param node node
     * @return Object 
     */
    function getOffset(node) {
        var bodyDims = document.body.getBoundingClientRect();
        var nodeDims = node.getBoundingClientRect();

        var offsets = {
            left: nodeDims.left - bodyDims.left,
            max: (nodeDims.left - bodyDims.left) + node.clientWidth
        };

        return offsets;
    }

    /**
     * createSpan helper function
     * 
     * Creates spans from a supplied elem,class 
     * list and text
     * 
     * @param Element spanElem
     * @param Array classes
     * @param String spanText
     * @return Elem
     */
    function createSpan(spanElem, classes, spanText) {

        classes.forEach(function (value, index, array) {
            spanElem.classList.add(value);
        });

        spanElem.firstChild
            .appendChild(document.createTextNode(spanText));
            
        spanElem.setAttribute('data-rs-value',spanText);

        return spanElem;
    }

    /**
     * setDefault heper function
     * 
     * checks if a data attribute exists
     * on an element,retruning its value
     * if it does or a default fallback if
     * it doesnt
     * 
     * @param attribute attr
     * @param mixed fallback
     * @return mixed 
     */
    function setDefault(attr, fallBack) {
        return (attr) ? attr.value : fallBack;
    }

    /**
     * Constructor for the RangeSlider object
     * 
     * Intended constructor function that inits
     * a RangeSlider object from a supplied DOM
     * node and an optional options object
     * 
     * @constructor
     * @param node node
     * @param Object options
     * @return RangeSlider
     */
    function RangeSlider(node, options) {
    
        /**
         * Check if the node RangeSlider is being 
         * registered on exists in the document
         */
        if (!node) {
            console.info("No node to attach Slider to");
            return;
        }
    
        /**
         * Default config object
         * 
         * Sets up the slider with data attribute
         * values or a preset default if the key doesn't 
         * exist
         */
        this.config = {
            steps: setDefault(node.attributes['data-rs-steps'], false),
            min: setDefault(node.attributes['data-rs-min'], 0),
            max: setDefault(node.attributes['data-rs-max'], 100),
            onRangeChange: function () { },
            afterInit: function () { },
        };
    
        /**
         * Extending the config file with the
         * options passed to the constructor
         * NOTE: Config options set with data attributes
         * will be overwritten if redeclared in the options
         * object passed to the constructor in JS
         */
        this.config = extend(this.config, options);

        this.baseElement = node;
        this.isStepped = false;
    
        //slider is built here
        this.init();
        
        //contextual reference for this keyword
        var slider = this;
            
        this.movePointer(this.rangeWidth, "%");

        this.pointer.addEventListener("mousedown", function (ev) {

            ev.preventDefault();
            slider.isFocussed = true;
        
            /**
             * Initialize the ptDrag object if it hasn't been
             * already.This might happen if the slider is not 
             * initially visible
             */
            if ((slider.ptDrag.minOffset === 0) ||
                (slider.ptDrag.maxOffset === 0)) {
                slider.initDragObject();
                slider.width = node.clientWidth;
            }
        
            /** 
            slider.ptDrag.maxOffset = 
                getOffset(slider.ranges[(slider.size - 1)]).max;
            */

            slider.ptDrag.start = this.style.left;
            this.classList.remove('transitionable');
            slider.rangeProgress.classList.remove('transitionable');

        });

        window.addEventListener("mousemove", debounce(function (ev) {
            if (slider.isFocussed === true) {
                
                var finalOffset;
                
                if(ev.clientX < slider.ptDrag.minOffset){
                    finalOffset = slider.evalPosition(slider.ptDrag.minOffset);
                }
                
                if(ev.clientX > slider.ptDrag.maxOffset){
                    finalOffset = slider.evalPosition(slider.ptDrag.maxOffset);
                }
                
                if ((ev.clientX > slider.ptDrag.minOffset) &&
                    (ev.clientX < slider.ptDrag.maxOffset)
                    ) {
                        finalOffset = slider.evalPosition(ev.clientX);
                    }
                    

                    slider.movePointer(finalOffset, "%");

                    var pointerCoors = getOffset(slider.pointer);

                    slider.ptDrag.lastOffset = pointerCoors.left;

                    if (pointerCoors.left < slider.ptDrag.minOffset) {
                        slider.ptDrag.lastOffset = slider.ptDrag.minOffset ;
                    }

                    if (pointerCoors.left > slider.ptDrag.maxOffset) {
                        slider.ptDrag.lastOffset = slider.ptDrag.maxOffset;
                    }            
                
            }
        }), 350);

        window.addEventListener("mouseup", function (ev) {
                      
            if (slider.isFocussed === true) {
                slider.isFocussed = false;
                
                if (slider.isStepped) {
                                
                  var offset = slider.evalPosition(slider.ptDrag.lastOffset);
                   
                   offset = ( offset / 100 ) * slider.scope;
                   
                   slider.setRange(Math.ceil(offset));
                   
                }

                slider.pointer.classList.add('transitionable');
                slider.rangeProgress.classList.add('transitionable');
                
            }
        });

        window.addEventListener("resize", function (ev) {
            slider.isFocussed = false;
            slider.reInit();
        });

        if (this.isStepped) {
            Array.prototype.forEach.call(slider.ranges,

                function (node, index, array) {

                    node.style.width = slider.rangeWidth + "%";

                    node.addEventListener('click', function () {
                            
                            Array.prototype.forEach.call(slider.ranges,
                                function (node, index, array) {
                                    node.classList.remove("highlighted");
                                });

                            this.classList.add("highlighted");
                            
                            slider.movePointer((index + 1) * (slider.rangeWidth ), "%"); 
                            
                            slider.currentRange = this.getAttribute('data-rs-value');
                        
                    });

                });
        }
        else {
            this.baseElement.addEventListener('click', function (e) {
                if (e.target !== slider.pointer) {
                    var finalOffset = slider.evalPosition(e.clientX);
                    slider.movePointer(finalOffset, "%");
                }
            });
        }

        this.config.afterInit();

    }

    /**
     * getRange method for RangeSlider
     * 
     * The getRange method returns the currently
     * selected range
     *
     * @return Number
     */
    RangeSlider.prototype.getRange = function () {
        return this.currentRange;
    };

    /**
     * setRange method for RangeSlider
     * 
     * The setRange method sets the current
     * selected range and performs a specified
     * callback function if range change was successful
     *
     * @return void
     */
    RangeSlider.prototype.setRange = function (value) {
         
         value = parseInt(value);           
        /**
         * If steps are enabled handle the click event of the 
         * step in which the value supplied falls
         */
        if(this.config.steps){
         
            var dropNode = this.scope / parseInt(this.size);
            
            dropNode =  Math.floor( (value / dropNode));
            
            //if the value doesnt fall within the range,abort!!
            if(dropNode < 0 || dropNode > this.size ){
                return;
            }
            else{
                this.ranges[dropNode].click();
            }
          }
         else{
             
         }
       
        
      this.config.onRangeChange();
    };

    RangeSlider.prototype.updateProgress = function (percentage) {
        if (percentage > 60) {
            if (percentage >= 85) {
                this.rangeProgress.classList.add("danger");
            }
            else {
                this.rangeProgress.classList.remove("danger");
                this.rangeProgress.classList.add("caution");
            }
        }
        else {
            this.rangeProgress.classList.remove("caution", "danger");
        }
    };


    /**
     * movePointer method for RangeSlider
     * 
     * The movePointer method accepts the distance
     * to move the target element(slider) and the
     * unit of movement
     * 
     * @param number move
     * @param string units
     * @return void
     */
    RangeSlider.prototype.movePointer = function (move, units) {
        this.pointer.style.left = (move -1) + units;
        this.rangeProgress.style.width = move + units;
        this.updateProgress(move);
    };

    /**
     * initDragObject method for RangeSlider
     * 
     * The initDragObject method defines the points
     * through which the pointer can move
     */
    RangeSlider.prototype.initDragObject = function () {
        this.width = this.baseElement.clientWidth;
        var offsets = getOffset(this.baseElement);
        this.ptDrag = {
            minOffset: offsets.left,
            maxOffset: offsets.max,
            lastOffset: 0,
            start: 0,
        };
    };

    /**
     * init method for RangeSlider
     * 
     * The init method generates the HTML
     * structure for the slider and sets up
     * all the internals
     * 
     * @return void
     */
    RangeSlider.prototype.init = function () {

        this.pointer = document.createElement('span');
        this.rangeProgress = document.createElement('span');

        this.pointer.classList.add('pointer', 'transitionable');
        this.rangeProgress.classList.add('range-progress', 'transitionable');

        this.baseElement.appendChild(this.pointer);
        this.baseElement.appendChild(this.rangeProgress);

        if (this.config.steps) {

            this.ranges = this.createRangeNodes();
            this.size = parseInt(this.config.steps);
            this.rangeWidth = (100 / this.size);
            this.isStepped = true;
        }
        
        this.scope  = 
            parseInt(this.config.max) - parseInt(this.config.min);  
        this.currentRange = this.config.min;
        this.ptDrag = {};
        this.width = this.baseElement.clientWidth;
        this.isFocussed = false;

        this.initDragObject();
    };
    
    RangeSlider.prototype.reInit= function(){
        this.scope  = 
            parseInt(this.config.max) - parseInt(this.config.min);  
        this.currentRange = this.config.min;
        this.ptDrag = {};
        this.width = this.baseElement.clientWidth;
        this.isFocussed = false;

        this.initDragObject();
    };

    /**
     * evalSliderPosition helper function
     * 
     * evaluates the slider position that relates
     * to the position of the mouse on execution
     * of an action
     * 
     * @param Number offset
     * @return Integer
     * 
     */
    RangeSlider.prototype.evalPosition = function (offset) {
        return (((offset - this.ptDrag.minOffset) / this.width)) * 100;
    };
    
    RangeSlider.prototype.createRangeNodes = function () {
        var
            slider = this,

            aSpanClasses = ['range', 'stepped'],

            minimum = parseFloat(this.config.min),

            maximum = parseFloat(this.config.max),

            steps = parseFloat(this.config.steps),

            scope = maximum - minimum,

            stepValue = scope / steps,

            aNodeArray = [];

        for (var i = 1; i <= steps; i++) {
            var rangeSpan = document.createElement('span');
            rangeSpan.appendChild(document.createElement('p'));

            switch (true) {
                case (i === 0):
                    rangeSpan =
                    createSpan(rangeSpan, aSpanClasses,
                        String(minimum + (i * stepValue)));
                    rangeSpan.classList.add('highlighted');
                    break;
                case ((steps - i) === 0):
                    rangeSpan =
                    createSpan(rangeSpan, aSpanClasses,
                        this.config.max);
                    break;
                default:
                    rangeSpan =
                    createSpan(rangeSpan, aSpanClasses,
                        String(Math.round(minimum + (i * stepValue))));
                    break;
            }

            slider.baseElement.appendChild(rangeSpan);
            aNodeArray.push(rangeSpan);
        }

        return aNodeArray;
    };

    return {
            create:function(node,options){
               var slider =  new RangeSlider(node,options);
               return slider; 
            }
    };

})();