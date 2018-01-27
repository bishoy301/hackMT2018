//soooo much stack overflow / random other sites / done quickly - so any love is good love
var url = "http://www.gw2spidy.com/api/v0.9/json/listings/19729/buy/2";
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.send();

xhr.addEventListener("readystatechange", processRequest, false);
//helper - this could probably be more general

function maxPrice(data){
        var m = -Infinity, i = 0, n = data.results.length;
        for (; i != n; ++i){
            if (data.results[i].unit_price > m) {
                m = data.results[i].unit_price;
            }
        }
        return m;
}

function getDate(data) {
    return new Date(data.results.listing_datetime);
}

function processRequest(e) {
if (xhr.readyState == 4 && xhr.status == 200) {
    var newString = xhr.responseText;
    var data = JSON.parse(xhr.responseText);
    //alert(response.results[0].unit_price);
            /* implementation heavily influenced by http://bl.ocks.org/1166403 */
            // NEEDS CHANGE FOR % SCREEN WIDTH
            var m = [80, 80, 80, 80]; // margins
            var w = 1000 - m[1] - m[3]; // width
            var h = 400 - m[0] - m[2]; // height


//another helper function
// helper function

//possible helpful code if date is formatted correctly ie not like the dummy JSON
/*// helper function
function getDate(d) {
return new Date(d.jsonDate);
}

// get max and min dates - this assumes data is sorted
var minDate = getDate(data[0]),
maxDate = getDate(data[data.length-1]);

var x = d3.time.scale().domain([minDate, maxDate]).range([0, w]);

Then you don't need to deal with the time interval functions, you can just pass x a date:

.attr("d", d3.svg.line()
.x(function(d) { return x(getDate(d)) })
.y(function(d) { return y(d.jsonHitCount) })
);*/

            // X scale will fit all values from data[] within pixels 0-w
            var x = d3.scale.linear().domain([0, data.count]).range([0, w]);
            // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
            var y = d3.scale.linear().domain([0, maxPrice(data)]).range([h, 0]);
                // automatically determining max range can work something like this
                // var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

            // create a line function that can convert data[] into x and y points
            var line = d3.svg.line()
                // assign the X function to plot our line as we wish
                .x(function(d,i) {
                    // verbose logging to show what's actually being done
                    console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
                    // return the X coordinate where we want to plot this datapoint
                    return x(i);
                })
                .y(function(d) {
                    // verbose logging to show what's actually being done
                    console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d.unit_price) + " using our yScale.");
                    // return the Y coordinate where we want to plot this datapoint
                    return y(d.unit_price);
                })

                // Add an SVG element with the desired dimensions and margin.
                var graph = d3.select("#graph").append("svg:svg")
                      .attr("width", w + m[1] + m[3])
                      .attr("height", h + m[0] + m[2])
                    .append("svg:g")
                      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

                // create yAxis
                var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
                // Add the x-axis.
                graph.append("svg:g")
                      .attr("class", "x axis")
                      .attr("transform", "translate(0," + h + ")")
                      .call(xAxis);


                // create left yAxis
                var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
                // Add the y-axis to the left
                graph.append("svg:g")
                      .attr("class", "y axis")
                      .attr("transform", "translate(-25,0)")
                      .call(yAxisLeft);

                  // Add the line by appending an svg:path element with the data line we created above
                // do this AFTER the axes above so that the line is above the tick-lines
                  graph.append("svg:path").attr("d", line(data.results));
}
}
