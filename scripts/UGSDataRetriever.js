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

            // How long ago the earthquake occurred in terms of days
            earthquake.ageDay = Math.floor(Math.abs((new Date().getTime()) - new Date(earthquake.date_time).getTime()) /
                (24 * 60 * 60 * 1000));
            //How long ago the earthquake occurred in terms of hours
            earthquake.ageHours = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / (60 * 60 * 1000)));

            //How long ago the earthquake occurred in terms of minutes
            earthquake.ageMinutes = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / ( 60 * 1000)));

            //How long ago the earthquake occurred in terms of seconds
            earthquake.ageSeconds = Math.floor(Math.abs((new Date().getTime() - new Date(earthquake.date_time).getTime())
                / ( 1000)));


            dataReturn.push(earthquake);


        }
        return dataReturn;

    };
    return EarthQuakeRetrieval;
});
