/**
 * Created by Shafiq on 8/1/2015.
 */


define(function() {
    'use strict';

    /**
     * Constructs a Earthquake Retrieval for a specified {@link WorldWindow}.
     * @alias earthQuakeRetrieval
     * @constructor
     * @classdesc Makes an HTML get request to RESTful API to get earthquake data
     * @param
     * @return returns an array containing earthquake data. Lower indices mark the later earthquakes.
     */

    function EarthQuakeRetrieval() {

        var earthQuakes = [];
        var xmlhttp = new XMLHttpRequest();
        var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=500";
        // The earthquake data is retrieved from the above URL using HTTP get.


        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var data = JSON.parse(xmlhttp.responseText);
                earthQuakes = EarthQuakeRetrieval.prototype.EarthQuakes(data);
            }
        };

        xmlhttp.open("GET", url, false);
        //NOTE: This makes a synchronous request
        // To make an asynchronous request make 3rd parameter "true"
        xmlhttp.send();
        return earthQuakes;
    }

    EarthQuakeRetrieval.prototype.EarthQuakes = function(data) {

        var dataReturn = [];       //This  will contain all the parsed data
        var earthquakes = data['features'];

        var i;
        for (i = 0; i < earthquakes.length; i++) {
            var quake = earthquakes[i];
            var geometry = quake['geometry'];
            var logistics = quake['properties'];


            var earthquake = {
                title: logistics['title'],
                magnitude: Number(logistics['mag']),
                date_time: Number(logistics['time']), 		// this variable contains time in millisecond since time 0 (1.1.1970)

                depth: Number(geometry['coordinates'][2]),
                latitude: Number(geometry['coordinates'][1]),
                longitude: Number(geometry['coordinates'][0])
            };

            if(earthquake.magnitude <2.0) continue;

            // How long ago the earthquake occurred in terms of days
            earthquake.ageDay = Math.floor(Math.abs((new Date().getTime()) - new Date(earthquake.date_time).getTime()) /
                (24 * 60 * 60 * 1000));
            //How long ago the earthquake occured in terms of hours
            earthquake.ageHours = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / (60 * 60 * 1000)));

            //How long ago the earthquake occured in terms of minutes
            earthquake.ageMinutes = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / ( 60 * 1000)));

            //How long ago the earthquake occured in terms of seconds
            earthquake.ageSeconds = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / ( 1000)));


            dataReturn.push(earthquake);


        }
        return dataReturn;

    };

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


    EarthQuakeRetrieval.prototype.getColor = function(time, transparent) {
        if (!transparent) {

            // If the earthquake happened less than 12 hours ago, then draw RED
            if (new Date().getTime() - time < 1000 * 60 * 60 * 24)
                return WorldWind.Color.RED;

            //if earthquake happened less than 24 hours ago, then Draw Yello
            else if (new Date().getTime() - time < 1000 * 60 * 60 * 48)
                return WorldWind.Color.YELLOW;
            else
            // Else draw Green
                return WorldWind.Color.GREEN;
        }
        else {
            // If the earthquake happened less than 12 hours ago, then draw transparent RED
            if (new Date().getTime() - time < 1000 * 60 * 60 * 24)
                return new WorldWind.Color(1, 0, 0, 0.5);

            //if earthquake happened less than 24 hours ago, then Draw transparent Yellow
            else if (new Date().getTime() - time < 1000 * 60 * 60 * 48)
                return new WorldWind.Color(1, 1, 0, 0.5);
            else
            // Else draw transparent Green
                return new WorldWind.Color(0, 1, 0, 0.5);
        }

    };

    return EarthQuakeRetrieval;
});
