/**
 * Created by tylerwhitlock on 8/15/15.
 */
/**
 * Created by Shafiq on 8/14/2015.
 */

/*
 * This main file should always be called from the main HTML file AFTER the webworldwind library has been loaded.
 * This takes LayerManger, UGSDataRetriever, and EarthquakeLayer as a dependency.
 * Thus the script inside the module is only loaded after all the dependencies have finished loading.
 */

//Note: LayerManager.js is part of www API.

define(['http://worldwindserver.net/webworldwind/examples/LayerManager.js','UGSDataRetriever','EarthquakeLayer'],function(LayerManager,EarthQuakeRetrieval,createPlaceMarks)
{
    'use strict';

    // instantiate the slider
    var slider = new Slider('#magnitudeSlider', {
        formatter: function (value) {
            return 'Current value: ' + value;
        }
    });

    var wwd;    // This will be the global WorldWindow Object

    // Register an event listener to be called when the page is loaded.
    window.addEventListener("load", eventWindowLoaded, false);


// Define the event listener to initialize Web World Wind.
    function eventWindowLoaded() {
        // Create a World Window for the canvas.
        wwd = new WorldWind.WorldWindow("canvasOne");

        // Add some image layers to the World Window's globe.
        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: false},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialLayer(null), enabled: true},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false},
            {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: false}
        ];

// Create those layers.
        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        var layerManager= new LayerManager(wwd);

        var earthQuakes =  new EarthQuakeRetrieval();
        var placeMark = new createPlaceMarks(wwd, earthQuakes);



        var cb = new Codebird;

        cb.setConsumerKey("VddGNUN9GWxbbKBoHDzhNRjjo","noC4s8BEKQCu4gZoXx2E13CYWzbA7gUjL9dM35IwJLtErfKTjb");
        cb.setToken("3416857132-Fv8A8BIrbb7OGYoUODrfDb8bDvqhu1OBbusFzgj","24qSgQIOfVBWiSudRI1GX9EivqrneqOqlG3c42gdA20Ny");


        var params = {
            status: placeMark.getInformationToDisplay(earthQuakes[0])
        };
        cb.__call(
            "statuses_update",
            params,
            function (reply) {
                //Currently we don't need to do anything with the reply received from twitter in JSON format.
                console.log(reply);
            }
        );

        slider.on('slideStop', function (arg) {
            var newearthquakelist = [];
            for (var i = 0; i < earthQuakes.length; i++) {
                if (earthQuakes[i].magnitude >= arg) {
                    newearthquakelist.push(earthQuakes[i]);
                }
            }
            var oldPlacemarks;
            for (var i = 0; i < wwd.layers.length; i++) {
                if (wwd.layers[i].displayName == "Placemarks") {
                    oldPlacemarks = wwd.layers[i];
                }
            }
            wwd.removeLayer(oldPlacemarks);
            new createPlaceMarks(wwd, newearthquakelist);

        });
    }

});
