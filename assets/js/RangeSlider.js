
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
 * @param Node node
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
function createSpan(spanElem,classes,spanText){
    
    classes.forEach(function(value,index,array){
        spanElem.classList.add(value);     
    });
    
    spanElem.firstChild
        .appendChild(document.createTextNode(spanText));
    
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
function setDefault(attr,fallBack){
    return (attr) ? attr.value : fallBack ;
}

/**
 * Constructor for the RangeSlider object
 * 
 * Intended constructor function that builds
 * a RangeSlider object from a supplied DOM
 * Node and an optional options object
 * 
 * @constructor
 * @param Node Node
 * @param Object options
 * @return RangeSlider
 */
function RangeSlider(Node, options) {
    
    /**
     * Check if the Node RangeSlider is being 
     * registered on exists in the document
     */
    if (!Node) {
        console.log("No node to attach Slider to");
        return;
    }
    
    /**
     * Default config object
     * 
     * Sets up the slider with data attribute
     * values or a preset default if the key doesn't 
     * exist
     */
    var cfg = {
        steps: setDefault(Node.attributes['data-steps'],false),
        min: setDefault(Node.attributes['data-min-value'],0),
        max: setDefault(Node.attributes['data-max-value'],100),
        onRangeChange: function () { },
        afterInit: function (){ },
    };
    
    /**
     * Extending the config file with the
     * options passed to the constructor
     * NOTE: Config options set with data attributes
     * will be overwritten if redeclared in the options
     * object passed to the constructor in JS
     */
    options = extend(cfg, options);
    
    
    this.domNode = Node;
    this.isStepped = false;
    
    //slider is built here
    this.build(options);

   	this.currentRange = options.min;
    this.ptDrag = {};
    this.width = Node.clientWidth;
    this.isFocussed = false;
    
    this.initDragObject();

    var 
        slider = this,
        rangeWidth = (100 / this.size);

    this.movePointer(rangeWidth, "%");

    this.pointer.addEventListener("mousedown", function (ev) {
        
        ev.preventDefault();
        slider.isFocussed = true;
        
        /**
         * Initialize the ptDrag object if it hasn't been
         * already.This might happen if the slider is not 
         * initially visible
         */
        if ( (slider.ptDrag.minOffset === 0) || 
             (slider.ptDrag.maxOffset === 0)) 
          {
                slider.initDragObject();
                slider.width = Node.clientWidth;
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
                         
            if ((ev.clientX >= slider.ptDrag.minOffset) &&
                (ev.clientX <= slider.ptDrag.maxOffset)
                ) {
                    
                    var finalOffset = slider.evalPosition(ev);
                
                slider.movePointer(finalOffset, "%");

                var pointerCoors = getOffset(slider.pointer);

                slider.ptDrag.lastOffset = pointerCoors.left;

                if (pointerCoors.left < slider.ptDrag.minOffset) {
                    slider.ptDrag.lastOffset = slider.ptDrag.minOffset;
                }

                if (pointerCoors.left > slider.ptDrag.maxOffset) {
                    slider.ptDrag.lastOffset = slider.ptDrag.maxOffset;
                }

            }
        }
    }), 350);

    window.addEventListener("mouseup", function (ev) {

        if (slider.isFocussed === true) {
            slider.isFocussed = false;
            
            if(slider.isStepped){
                var landingNode = Array.prototype.filter.call(slider.ranges, function (node) {

                    var coords = getOffset(node);

                    return ((slider.ptDrag.lastOffset >= coords.left) &&
                        (slider.ptDrag.lastOffset <= coords.max)
                        );

                });
                
                landingNode[0].click();                
            }
            
            slider.pointer.classList.add('transitionable');
            slider.rangeProgress.classList.add('transitionable');

        }
    });

    window.addEventListener("resize", function (ev) {
        slider.isFocussed = false;
        slider.initDragObject();
    });

    if(this.isStepped){
        Array.prototype.forEach.call(slider.ranges,

        function (node, index, array) {

            node.style.width = rangeWidth + "%";

            node.addEventListener('click', function () {

                Array.prototype.forEach.call(slider.ranges,
                    function (node, index, array) {
                        node.classList.remove("highlighted");
                    });

                this.classList.add("highlighted");

                if ((slider.range !== this.getAttribute('data-value'))) {

                    slider.movePointer(((index + 1) * rangeWidth), "%");
                    slider.setRange(this.getAttribute('data-value'),options.onRangeChange);
                }
            });

        });    
    }
    else{
       this.domNode.addEventListener('click',function(e){
           if(e.target !== slider.pointer){
               var finalOffset = slider.evalPosition(e);
               slider.movePointer(finalOffset, "%");                 
           }           
       }); 
    }
           
        options.afterInit();

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
RangeSlider.prototype.setRange = function (value,fn) {
    this.currentRange = value;
    fn();
    
};

RangeSlider.prototype.monitorProgress = function (percentage) {
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
    this.pointer.style.left = (move - 3) + units;
    this.rangeProgress.style.width = move + units;
    this.monitorProgress(move);
};

/**
 * initDragObject method for RangeSlider
 * 
 * The initDragObject method defines the points
 * through which the pointer can move
 */
RangeSlider.prototype.initDragObject = function () {
	this.width = this.domNode.clientWidth;
    var offsets = getOffset(this.domNode);
    this.ptDrag = {
        minOffset: offsets.left,
        maxOffset: offsets.max,
        lastOffset: 0,
        start: 0,
    };
};

/**
 * build method for RangeSlider
 * 
 * The build method generates the HTML
 * structure for the slider
 * 
 * @param Object options
 * @return void
 */
RangeSlider.prototype.build = function (options) {
                
      this.pointer = document.createElement('span');
      this.rangeProgress = document.createElement('span');
      
      this.pointer.classList.add('pointer','transitionable');
      this.rangeProgress.classList.add('range-progress','transitionable');
      
      this.domNode.appendChild(this.pointer);
      this.domNode.appendChild(this.rangeProgress);
   
   if(options.steps){  
       
       this.ranges =  this.createRangeNodes(options);
       this.size = parseInt(options.steps);
       this.isStepped = true;
   }
};

/**
 * evalSliderPosition helper function
 * 
 * evaluates the slider position that relates
 * to the position of the mouse during on execution
 * of an action
 * 
 * @param Event ev
 * @return Integer
 * 
 */
RangeSlider.prototype.evalPosition = function (ev){
   return (((ev.clientX - this.ptDrag.minOffset) / this.width)) * 100;
};


RangeSlider.prototype.createRangeNodes = function(options){
    var
        slider = this,
        
        aSpanClasses = ['range','stepped'],
        
        minimum = parseFloat(options.min),
        
        maximum = parseFloat(options.max), 
       
        steps = parseFloat(options.steps),
        
        scope = maximum - minimum,

        stepValue = scope / steps,

        aNodeArray = [];
             
    for(var i = 1;i <= steps ; i++ ){
        var rangeSpan = document.createElement('span');
        rangeSpan.appendChild(document.createElement('p'));
        
        switch(true){
            case  (i === 0):
                rangeSpan = 
                     createSpan(rangeSpan,aSpanClasses,
                                String(minimum + (i * stepValue))); 
                rangeSpan.classList.add('highlighted');             
            break;
            case ((steps - i) === 0):
                rangeSpan = 
                     createSpan(rangeSpan,aSpanClasses,
                                options.max);               
            break;
            default:
                rangeSpan = 
                     createSpan(rangeSpan,aSpanClasses,
                                String(Math.round(minimum + (i * stepValue))));                
            break;
        }
        
        slider.domNode.appendChild(rangeSpan);
        aNodeArray.push(rangeSpan);
    }
    
    console.log(aNodeArray);
    return aNodeArray;
};