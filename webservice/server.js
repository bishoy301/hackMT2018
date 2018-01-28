const express = require('express');
const admin = require('firebase-admin');
const app = express();


const serviceAccount = require("./hackmt2018-ebd27-firebase-adminsdk-d6psx-c9249b56da.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackmt2018-ebd27.firebaseio.com"
});

let db = admin.database();
let itemsRef = db.ref('items');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/sell/:id', (req, res) => {
    let id = Number.parseInt(req.params.id);
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
}).post((req, res) => {
    try {
        let id = Number.parse(req.params.id);
        let body = Object.assign({}, req.body);
        itemsRef.child(id).child('result').set(body);
        console.log('I got called!')

        res.send(200);
    } catch(err) {
        res.send(500);
    }
});

app.get('/bestResults/buy', (req, res) => {

});

app.get('/bestResults/sell', (req, res) => {

});

app.listen(3000, () => console.log('WebService app listening on port 3000!'))
