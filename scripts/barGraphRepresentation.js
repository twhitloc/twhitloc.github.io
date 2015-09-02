/**
 * Created by Shafiq on 8/25/2015.
 */


define(['http://worldwindserver.net/webworldwind/worldwindlib.js','UGSDataRetriever','EarthquakeLayer'],function(ww,EarthQuakeRetrieval,createPlaceMarks){



    /**
     * Constructs a layer showing earthquake data as polynomial to mimic bar graph representation{@link WorldWindow}.
     * @alias barGraphRepresentation
     * @constructor
     * @classdesc Adds a renderable layer and shows relevant earthquake data on it .
     * @param {WorldWindow} worldWindow The World Window to associated this layer manager with.
     * @param earthQuakes  - The array containing the earthquake data.
     */


    function barGraphRepresentation(wwd, earthQuakes) {


        // Create a layer to hold the polygons.
        var polygonsLayer = new WorldWind.RenderableLayer();
        polygonsLayer.displayName = "3D EarthQuake View";
        polygonsLayer.enabled = false;
        wwd.addLayer(polygonsLayer);



        for (var i = 0; i < earthQuakes.length; i++) {

            var height = Number(earthQuakes[i].magnitude) * 2.5 - 3;
            var colorNonTransparent = EarthQuakeRetrieval.prototype.getColor(earthQuakes[i].date_time, false);
            var colorTransparent = EarthQuakeRetrieval.prototype.getColor(earthQuakes[i].date_time, true);

            // Define an outer boundary to make a polygon.
            var boundaries = [];
            boundaries[0] = []; // outer boundary
            boundaries[0].push(new WorldWind.Position(earthQuakes[i].latitude + 0.25, earthQuakes[i].longitude - 0.25, 1e5 * height));
            boundaries[0].push(new WorldWind.Position(earthQuakes[i].latitude + 0.25, earthQuakes[i].longitude + 0.25, 1e5 * height));
            boundaries[0].push(new WorldWind.Position(earthQuakes[i].latitude - 0.25, earthQuakes[i].longitude + 0.25, 1e5 * height));
            boundaries[0].push(new WorldWind.Position(earthQuakes[i].latitude - 0.25, earthQuakes[i].longitude - 0.25, 1e5 * height));

            // Create the polygon and assign its attributes.

            var polygon = new WorldWind.Polygon(boundaries, null);
            polygon.altitudeMode = WorldWind.ABSOLUTE;
            polygon.extrude = true; // extrude the polygon edges to the ground

            var polygonAttributes = new WorldWind.ShapeAttributes(null);
            polygonAttributes.drawInterior = true;
            polygonAttributes.drawOutline = true;
            polygonAttributes.outlineColor = colorNonTransparent;
            polygonAttributes.interiorColor = colorTransparent;
            polygonAttributes.drawVerticals = true;
            polygon.attributes = polygonAttributes;

            // Create and assign the polygon's highlight attributes.
            var highlightAttributes = new WorldWind.ShapeAttributes(polygonAttributes);
            highlightAttributes.outlineColor = WorldWind.Color.BLUE;
            highlightAttributes.interiorColor = new WorldWind.Color(1, 1, 1, 0.5);
            polygon.highlightAttributes = highlightAttributes;

            //Add Full Label to the layer
            polygon.fullLabel = createPlaceMarks.prototype.getInformationToDisplay(earthQuakes[i]);
            // Have a magnitude field as well
            polygon.magnitude = Number(earthQuakes[i].magnitude);
            polygon.ageInHours = Number(earthQuakes[i].ageHours);


            // Add the polygon to the layer and the layer to the World Window's layer list.
            polygonsLayer.addRenderable(polygon);

        }

    }

    return barGraphRepresentation;



});