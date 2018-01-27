  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
  .x(function(d) { return x(new Date(d.listing_datetime)); })
  .y(function(d) { return y(d.unit_price); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

// Get the data
var url = "https://www.gw2spidy.com/api/v0.9/json/listings/19729/buy/1";
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
//xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
xhr.send();

xhr.addEventListener("readystatechange", processRequest, false);
//helper - this could probably be more general

function processRequest(e) {
if (xhr.readyState == 4 && xhr.status == 200) {
  var newString = xhr.responseText;
  var data = JSON.parse(xhr.responseText);


  var results = data.results;
  console.log("yo this is data:", results);



  // Scale the range of the data
  x.domain(d3.extent(results, function(d) { return new Date(d.listing_datetime); }));
  y.domain([0, d3.max(results, function(d) { return d.unit_price; })]);

  // Add the valueline path.
  svg.append("path")
          .data([results])
          .attr("class", "line")
          .attr("d", valueline);

  // Add the X Axis
  svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
          .call(d3.axisLeft(y));

}

};
