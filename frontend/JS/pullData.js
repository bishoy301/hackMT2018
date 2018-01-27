var apiKey ="key";

getJSON(
    'http://www.gw2spidy.com/api/v0.9/json/listings/19729/sell/2',
function(err, data) {
    if(err !== null) {
        alert('Something broke, here: ' + err);
    }else{
        //pull data and do stuff
    }
});