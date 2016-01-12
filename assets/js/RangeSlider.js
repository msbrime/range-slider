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

function getOffset(node) {
    var bodyDims = document.body.getBoundingClientRect();
    var nodeDims = node.getBoundingClientRect();

    var offsets = {
        left: nodeDims.left - bodyDims.left,
        max: (nodeDims.left - bodyDims.left) + node.clientWidth
    };

    return offsets;
}

function RangeSlider(Node, options) {

    if (!Node) {
        console.log("No node to attach Slider to");
        return;
    }

    var cfg = {
        initialValue: 500,
        onRangeChange: function () { }
    };

    options = extend(cfg, options);

    this.domNode = Node;
   	this.ranges =
    Node.querySelectorAll(".range");
   	this.size =
    this.ranges.length;
   	this.pointer =
    Node.querySelector(".range-slider .pointer");
   	this.rangeProgress =
    Node.querySelector(".range-slider .range-progress");
   	this.currentRange = options.initialValue;
    this.ptDrag = {};
    this.width = Node.clientWidth;
    this.isFocussed = false;
    this.initDragObject();

    var slider = this,
        rangeWidth = (100 / this.size);


    this.movePointer(rangeWidth, "%");

    this.pointer.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
        slider.isFocussed = true;


        if ((slider.ptDrag.minOffset === 0) || (slider.ptDrag.maxOffset === 0)) {
            slider.initDragObject();
            slider.width = Node.clientWidth;
        }

        slider.ptDrag.maxOffset = getOffset(slider.ranges[(slider.size - 1)]).max;

        slider.ptDrag.start = this.style.left;
        this.classList.remove('transitionable');
        slider.rangeProgress.classList.remove('transitionable');

    });

    window.addEventListener("mousemove", debounce(function (ev) {
        if (slider.isFocussed === true) {
            if ((ev.clientX >= slider.ptDrag.minOffset) &&
                (ev.clientX <= slider.ptDrag.maxOffset)
                ) {

                var finalOffset = (((ev.clientX - slider.ptDrag.minOffset) / slider.width)) * 100;
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

            var landingNode = Array.prototype.filter.call(slider.ranges, function (node) {

                var coords = getOffset(node);

                return ((slider.ptDrag.lastOffset >= coords.left) &&
                    (slider.ptDrag.lastOffset <= coords.max)
                    );

            });

            landingNode[0].click();
            slider.pointer.classList.add('transitionable');
            slider.rangeProgress.classList.add('transitionable');

        }
    });

    window.addEventListener("resize", function (ev) {
        slider.isFocussed = false;
        slider.initDragObject();
    });


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
                    slider.currentRange = this.getAttribute('data-value');
                    options.onRangeChange();

                }
            });



        });

}

RangeSlider.prototype.getRange = function () {
    return this.currentRange;
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

RangeSlider.prototype.movePointer = function (move, units) {
    this.pointer.style.left = (move - 1) + units;
    this.rangeProgress.style.width = move + units;
    this.monitorProgress(move);
};

RangeSlider.prototype.initDragObject = function () {
	this.width = this.domNode.clientWidth;
    this.ptDrag = {
        minOffset: getOffset(this.ranges[0]).left,
        maxOffset: getOffset(this.ranges[(this.size - 1)]).max,
        lastOffset: 0,
        start: 0,
    };
};