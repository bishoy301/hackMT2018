const express = require('express');
const admin = require('firebase-admin');
const app = express();
var bodyParser = require('body-parser'); 


const serviceAccount = require("./hackmt2018-ebd27-firebase-adminsdk-d6psx-c9249b56da.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackmt2018-ebd27.firebaseio.com"
});

let db = admin.database();
let itemsRef = db.ref('items');

app.use(bodyParser.urlencoded()); 
app.use(bodyParser.json()); 

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/sell/:id', (req, res) => {
    let id = req.params.id;
    itemsRef.child(id).child('sells').once('value', (snapshot) => {
        let sellData = {
            results: []
        };
        let val = snapshot.val();

        if (val) {
            val.forEach((element) => {
                sellData.results.push({
                    unit_price: element.unit_price,
                    quantity: element.quantity,
                    listing_datetime: new Date(element.listing_datetime)
                })
            });
        }

        res.json(sellData);
    });
});

app.get('/buy/:id', (req, res) => {
    let id = Number.parseInt(req.params.id);
    itemsRef.child(id).child('buys').once('value', (snapshot) => {
        let buyData = {
            results: []
        };
        let val = snapshot.val();

        if (val) {
            val.forEach((element) => {
                buyData.results.push({
                    unit_price: element.unit_price,
                    quantity: element.quantity,
                    listing_datetime: new Date(element.listing_datetime)
                })
            });
        }

        res.json(buyData);
    });



});

app.get('/results/:id', (req, res) => {
    res.send('not ready yet, sorry about it :)')
});

app.post('/results/:id', (req, res) => {
    try {
        let id = Number.parseInt(req.params.id);
        let body = Object.assign({}, req.body);
        itemsRef.child(id).child('result').set({
            buyAverage: Number.parseFloat(body.buyAverage),
            discount: Number.parseFloat(body.discount),
            sellAverage: Number.parseFloat(body.sellAverage),
            status: Number.parseInt(body.status),
            timestamp: body.timestamp
        });

        res.sendStatus(200);
    } catch(err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/bestResults/buy', (req, res) => {
    // return an array of ids, match status, sorted in descending order by discount
    itemsRef.orderByChild('result/status').equalTo(1).once("value", (data) => {
        let items = data.val(); 

        

        // So, I was thinking, we're gonna use an old classic a DBA once taught me.
        let dataAsArray = []; 
        keys = Object.keys(items); 
         
        keys.forEach((key) => {
            let obj = {};
            obj[key] = items[key].result;
            dataAsArray.push(obj); 
        }); 

        dataAsArray.sort((a, b) => {
            return b[Object.keys(b)[0]].discount - a[Object.keys(a)[0]].discount; 
        }); 
        

        res.send(JSON.stringify(dataAsArray)); 
    }); 
});

app.get('/bestResults/sell', (req, res) => {

    // return an array of ids, match status, sorted in descending order by discount
    itemsRef.orderByChild('result/status').equalTo(2).once("value", (data) => {
        let items = data.val(); 


        // So, I was thinking, we're gonna use an old classic a DBA once taught me.
        let dataAsArray = []; 
        keys = Object.keys(items); 
     
        keys.forEach((key) => {
            let obj = {};
            obj[key] = items[key].result;
         dataAsArray.push(obj); 
        }); 

        dataAsArray.sort((a, b) => {
            return b[Object.keys(b)[0]].discount - a[Object.keys(a)[0]].discount; 
        }); 
    

        res.send(JSON.stringify(dataAsArray)); 
    }); 
});

app.listen(3000, () => console.log('WebService app listening on port 3000!'))



