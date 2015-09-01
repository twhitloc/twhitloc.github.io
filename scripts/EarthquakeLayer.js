
define(['http://worldwindserver.net/webworldwind/worldwindlib.js','UGSDataRetriever'],function(ww,EarthQuakesRetrieval) {

    "use strict";

    /**
     * Constructs a layer showing earthquake data for a specified {@link WorldWindow}.
     * @alias createPlaceMarks
     * @constructor
     * @classdesc Adds a renderable layer and shows relevant earthquake data on it .
     * @param {WorldWindow} worldWindow The World Window to associated this layer manager with.
     * @param earthQuakes  - The array containing the earthquake data.
     */

    function createPlaceMarks(wwd, earthQuakes) {
        //Display the data in information center for the latest earthquake by default
        document.getElementById("eData").innerHTML = this.getInformationToDisplay(earthQuakes[0]);

        // Define the images we'll use for the placemarks.
        var images = [
            "white-dot.png"
        ];

        var dotLibrary = WorldWind.configuration.baseUrl + "images/", // location of the image files
            placemark,
            placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
            highlightAttributes,
            placemarkLayer = new WorldWind.RenderableLayer("Placemarks");


        // Set up the common placemark attributes.
        placemarkAttributes.imageScale = 0.125;
        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 0.5);
        placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 0.5);
        placemarkAttributes.labelAttributes.color = WorldWind.Color.YELLOW;
        placemarkAttributes.drawLeaderLine = true;
        placemarkAttributes.leaderLineAttributes.outlineColor = WorldWind.Color.RED;


        // For each placemark image, create a placemark with a label.
        for (var i = 0, len = earthQuakes.length; i < len; i++) {

            // if earthquakes magnitude is less than 2, don't draw it.
            // The following if statement can also be used in conjunction with a slide
            //     to only show earthquakes greater than a certain value

            if (earthQuakes[i].magnitude < 2)continue;


            // Create the placemark and its label.
            placemark = new WorldWind.Placemark(
                new WorldWind.Position(earthQuakes[i].latitude, earthQuakes[i].longitude, 1e2), true, null);


            //This label will appear on top of the circle object
            placemark.label = " " + "\n" + "Mag:" + earthQuakes[i].magnitude;

            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;


            // Above this distance shapes will get inversely proportional to the eye distance to give distance affect.
            // Zooming out up to this eye distance makes shapes increase size.
            placemark.eyeDistanceScalingThreshold = 1e6 * 30;

            // Label will not be visible above this eye distance. This makes the globe clean and nice to look at.
            placemark.eyeDistanceScalingLabelThreshold = (placemark.eyeDistanceScalingThreshold ) / 100;

            //THis label will be used to print the information in a dialog box
            placemark.fullLabel = this.getInformationToDisplay(earthQuakes[i]);

            // Create the placemark attributes for this placemark.
            placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            placemarkAttributes.imageSource = dotLibrary + images[0];

            //set the color to nontransparent image color based on how long ago was the earthquake
            placemarkAttributes.imageColor = this.getColor(earthQuakes[i].date_time, false);
            placemark.attributes = placemarkAttributes;

            // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
            // the default highlight attributes so that all properties are identical except the image scale.
            highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 0.25;
            placemark.highlightAttributes = highlightAttributes;

            // Add the placemark to the layer.
            placemarkLayer.addRenderable(placemark);
        }

        // Add the placemarks layer to the World Window's layer list.
        wwd.addLayer(placemarkLayer);

        // Create a layer manager for controlling layer visibility.
        // var layerManger = new LayerManager(wwd);


        // Now set up to handle picking.
        var highlightedItems = [];

        // The common pick-handling function.
        var handlePick = function (o) {
            // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
            // the mouse or tap location.
            var x = o.clientX,
                y = o.clientY;

            var redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items

            // De-highlight any previously highlighted placemarks.
            for (var h = 0; h < highlightedItems.length; h++) {
                highlightedItems[h].highlighted = false;
            }
            highlightedItems = [];

            // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
            // relative to the upper left corner of the canvas rather than the upper left corner of the page.
            var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                redrawRequired = true;
            }

            // Highlight the items picked by simply setting their highlight flag to true.
            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    pickList.objects[p].userObject.highlighted = true;

                    // Keep track of highlighted items in order to de-highlight them later.
                    highlightedItems.push(pickList.objects[p].userObject);

                    // Detect whether the placemark's label was picked. If so, the "labelPicked" property is true
                    if (pickList.objects[p].labelPicked) {

                        document.getElementById("eData").innerHTML = pickList.objects[p].userObject.fullLabel;


                    }
                }
            }

            // Update the window if we changed anything.
            if (redrawRequired) {
                wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };

        // Listen for mouse moves and highlight the placemarks that the cursor rolls over.
        wwd.addEventListener("mousemove", handlePick);

        // Listen for taps on mobile devices and highlight the placemarks that the user taps.
        var tapRecognizer = new WorldWind.TapRecognizer(wwd, handlePick);
    }


    /*   -----------------------------------------------------------------------
     @Description: The function will return a color based on how old the earthquake is
     and whether or not the color needs to be transparent.

     @Param: time
     Its the time of earthquake in milliseconds with reference to Zero Time ( 1-1-1970)

     @Param:transparent
     A boolean value indicating wether or not the color needs to be transparent.

     @return:  Color
     its the color object

     --------------------------------------------------------------------------------*/


    createPlaceMarks.prototype.getColor = function(time, transparent) {
        if (!transparent) {

            // If the earthquake happened less than 12 hours ago, then draw RED
            if (new Date().getTime() - time < 1000 * 60 * 60 * 12)
                return WorldWind.Color.RED;

            //if earthquake happened less than 24 hours ago, then Draw Yello
            else if (new Date().getTime() - time < 1000 * 60 * 60 * 24)
                return WorldWind.Color.YELLOW;
            else
            // Else draw Green
                return WorldWind.Color.GREEN;
        }
        else {
            // If the earthquake happened less than 12 hours ago, then draw transparent RED
            if (new Date().getTime() - time < 1000 * 60 * 60 * 12)
                return new WorldWind.Color(1, 0, 0, 0.75);

            //if earthquake happened less than 24 hours ago, then Draw transparent Yellow
            else if (new Date().getTime() - time < 1000 * 60 * 60 * 24)
                return new WorldWind.Color(1, 1, 0, 0.75);
            else
            // Else draw transparent Green
                return new WorldWind.Color(0, 1, 0, 0.75);
        }

    }


    /*   -----------------------------------------------------------------------
     @Description: The function gets earthquake object instance as an input
     It parses all the relevant data that needs to be displayed in a paragraph format;

     @Param: earthquake
     its an earthquake object instance
     @return:  timeString
     its the string neded to display data

     @NOTE: Additional data (such as nearest city names ) can be added to this function

     --------------------------------------------------------------------------------*/
    createPlaceMarks.prototype.getInformationToDisplay = function(earthquake) {
        if(earthquake) {   // Only if earthquake is NOT a null string

            var timeString = "<br>" + earthquake.title;

            if (earthquake.ageDay > 0) {

                timeString = timeString + "<br>" + earthquake.ageDay +
                    ((earthquake.ageDay > 1 ) ? "  days ago " : "  day ago");

            }
            else if (earthquake.ageHours > 0) {
                timeString = timeString + "<br>" + earthquake.ageHours +
                    ((earthquake.ageHours > 1 ) ? "  hours ago " : "  hour ago");
            }
            else if (earthquake.ageMinutes > 0) {
                timeString = timeString + "<br>" + earthquake.ageMinutes +
                    ((earthquake.ageMinutes > 1 ) ? "  minutes ago " : "  minute ago");
            }
            else {
                timeString = timeString + "<br>" + earthquake.ageSeconds +
                    ((earthquake.ageSeconds > 1 ) ? "  seconds ago " : "  second ago");
            }
            timeString += "<br> Depth : " + earthquake.depth + " kilometers";

            return timeString;
        }
    }

    /*   -----------------------------------------------------------------------
     @Description: The function gets earthquake object instance as an input
     It parses all the relevant data that needs to be displayed in a paragraph format;

     @Param: earthquake
     its an earthquake object instance
     @return:  timeString
     its the string neded to display data

     @NOTE: Additional data (such as nearest city names ) can be added to this function

     --------------------------------------------------------------------------------*/
    createPlaceMarks.prototype.getTweetText = function(earthquake) {
        if(earthquake) {   // Only if earthquake is NOT a null string

            var timeString = "<!>   " + earthquake.title + " ";

            if (earthquake.ageDay > 0) {

                timeString = timeString +  earthquake.ageDay +
                    ((earthquake.ageDay > 1 ) ? "  days ago " : "  day ago ");

            }
            else if (earthquake.ageHours > 0) {
                timeString = timeString + earthquake.ageHours +
                    ((earthquake.ageHours > 1 ) ? "  hours ago " : "  hour ago ");
            }
            else if (earthquake.ageMinutes > 0) {
                timeString = timeString + earthquake.ageMinutes +
                    ((earthquake.ageMinutes > 1 ) ? "  minutes ago " : "  minute ago ");
            }
            else {
                timeString = timeString + earthquake.ageSeconds +
                    ((earthquake.ageSeconds > 1 ) ? "  seconds ago " : "  second ago ");
            }
            timeString += " Depth : " + earthquake.depth + " kilometers";

            return timeString;
        }
    }

    return createPlaceMarks;
});

