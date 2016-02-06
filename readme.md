#RangeSlider
RangeSlider is a lightweight native javascript library that allows you to
implement a simple range slider in your interfaces.
#How To Use
##Setup

1. Copy the js and css files from the build folder to the appropriate
   directories in your project

2. Include _rangeslider.min.js_ in your documents scripts

3. Include _rangeslider.css_ in your stylesheet declarations

##Initialization
To initialize RangeSlider on a DOM Node **(preferably a div)**, just create
the following HTML structure:

 `<div id = 'my_range_slider' class = 'range-slider'></div>`
 
 Then activate the slider via JS with:
 
 `var myRangeSlider = new RangeSlider(document.querySelector('#my_range_slider'));`
 
 ##Configuration
 RangeSlider comes with some useful config options:
 
 1. **min**: The minimum value of the range <br> _default_: 0
 
 2. **max**: The maximum value of the range <br> _deafult:100
 
 3. **steps**: Display slider with stepped demarkations <br> _default_:false
 
 
 These config options can be set with either data attributes or as a JS config
 object passed to the constructor
 
 > Options set via data attributes will be overwritten if redeclared or reassigned
 in the javascript object
 
 ###Examples
 
 1. To produce a stepped slider with a range minimum of _1000_, a
 range maximum of _10000_ and _10_ steps:
 
 `<div id = 'my_range_slider' class = 'range-slider'
 data-min-value = '1000' data-max-value = '10000' steps = '10'>
 </div>`
 
> OR:

`var config = {
    min:1000,
    max:10000,
    steps:10
};
new RangeSlider(document.querySelector('#my_range_slider'))`