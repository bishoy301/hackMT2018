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

        addRowHandlers('sell');
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

        addRowHandlers('buy');
    });

    function addRowHandlers(tableName) {
        var table = document.getElementById(tableName);
        var rows = table.getElementsByTagName("tr");
        for (i = 0; i < rows.length; i++) {
            var currentRow = table.rows[i];
            var createClickHandler =
                function (row) {
                    return function () {
                        var cell = row.getElementsByTagName("td")[0];
                        var id = cell.innerHTML;
                        alert("id:" + id);
                    };
                };

            currentRow.onclick = createClickHandler(currentRow);
        }
    }

    $('radio').on('click',function(){
            var buyHeader = $('#buyHeader');
            var buyTable = $('#buy');

            var sellHeader = $('#sellHeader');
            var sellTable = $('#sell');

            console.log('doot');
    });
});