#RangeSlider
RangeSlider is a lightweight native javascript plugin that allows you to
implement a simple range slider in your interfaces.
#How To Use
##Setup

1. Copy the js and css files from the build folder to the appropriate
   directories in your project  
2. Include _rangeslider.min.js_ in your documents scripts  
3. Include _rangeslider.css_ in your stylesheet declarations    


##Initialization

To initialize RangeSlider on a DOM Node **(preferably a div)**, just create 
an HTML element similar to:

    <div id = 'my_range_slider' ></div>
 
 Then activate the slider via JS with:
 
    var myRangeSlider = RangeSlider.create('#my_range_slider');

>To access the properties and methods on the slider you must   
store it in a variable like shown above
 
##Configuration
  
 RangeSlider comes with some useful config options:
 
1. **min**: The minimum value of the range  
  _data attribute_: data-rs-min  
  _default_: 0 
2. **max**: The maximum value of the range  
  _data attribute_: data-rs-max  
  _deafult_:100   
3. **steps**: Display slider with earmarked steps  
 _data attribute_: data-rs-steps  
 _default_:false  
 
 
 These config options can be set with either data attributes or as a JS config
 object passed to the constructor
 
 > Options set via data attributes will be **_overwritten_** if redeclared or reassigned
 in the javascript object  
 
 
##Examples

1. To produce the default slider with a range minimum of _**0**_ and a range maximum of
  _**100**_

        <div id = 'my_range_slider'></div>
    
        RangeSlider.create('#my_range_slider');

2. To produce an unstepped slider with a range minimum of _**500**_ and a range maximum 
   of _**5000**_:

        <div id = 'my_range_slider' data-rs-min = '500' 
            data-rs-max = '5000'>
        </div>
    
        RangeSlider.create('#my_range_slider');
    
    > OR 
   
        var config = {
            min:500,
            max:5000
         };
    
        RangeSlider.create('#my_range_slider',config);

3. To produce a stepped slider with a range minimum of _**1000**_, a range maximum of
 _**7200**_ and _**8**_ steps:  

        <div id = 'my_range_slider' data-rs-min = '1000' 
            data-rs-max = '10000' data-rs-steps = '8'>
        </div>
    
        RangeSlider.create('#my_range_slider');
   
   > OR
   
        var config = {
            min:1000,
            max:7200,
            steps:8
        };
    
        RangeSlider.create('#my_range_slider',config);
    
##Methods

1. **setRange**: Sets the value of the slider to a provided value if it falls within 
   the minimum or maximum range.Will default to the minimum or maximum value if the value 
   provided is too low or too high  
    `myRangeSlider.setRange(Number range);`
2. **getRange**: Returns the current range value of the slider  
    `myRangeSlider.getRange();`
3. **reInit**:Recalculates offsets,width and positioning of the slider,useful when 
   the slider or parent  element has `(display:hidden)` set and is not initially 
   visible.    
    `myRangeSlider.reInit();` 

##Callbacks
 These are declared in the config object
1. **afterInit**: A function to be executed once the slider has been set up 
   successfully.The slider can be passed as an argument
   
        var config = {
            afterInit:function(slider){
                slider.setRange(50)
            }
        }
        
        RangeSlider.create('#my_range_slider',config);
      
2. **onRangeChange**: A function to be executed whenever the value of the slider 
   changes.The slider can be passed as an argument
   
         var config = {
            onRangeChange:function(slider){
                alert("the new range value is"+ slider.getRange());
            }
        }
    
        RangeSlider.create('#my_range_slider',config);