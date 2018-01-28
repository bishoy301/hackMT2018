$(document).ready(function () {
 
    $.get("http://localhost:3000/bestResults/sell", function (data) {
        var data = JSON.parse(data);
        var table = document.getElementById('sell');

        data.forEach(function (element, index) {
            var key = Object.keys(element)[0];

            var row = table.insertRow(index+1);
            var cell = row.insertCell(0);
            cell.innerHTML = key;
            cell = row.insertCell(1);
            cell.innerHTML = element[key].buyAverage;
            cell = row.insertCell(2);
            cell.innerHTML = element[key].discount;
        });
    });

    $.get("http://localhost:3000/bestResults/buy", function (data) {
        var data = JSON.parse(data);
        var table = document.getElementById('buy');

        data.forEach(function (element, index) {
            var key = Object.keys(element)[0];

            var row = table.insertRow(index+1);
            var cell = row.insertCell(0);
            cell.innerHTML = key;
            cell = row.insertCell(1);
            cell.innerHTML = element[key].buyAverage;
            cell = row.insertCell(2);
            cell.innerHTML = element[key].discount;
        });
    });
});