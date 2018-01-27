const https = require('https');
const admin = require("firebase-admin");
const RateLimiter = require("request-rate-limiter");

var serviceAccount = require("./hackmt2018-ebd27-firebase-adminsdk-d6psx-c9249b56da.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackmt2018-ebd27.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("restricted_access/secret_document");

var limiter = new RateLimiter();

async function runService() {
    try {
        // Pull all crafting material ids
        // let craftingIds = await httpRequest({
        //     host: 'api.guildwars2.com',
        //     port: 443,
        //     method: 'GET',
        //     path: '/v2/materials'
        // });

        let response = await limiter.request({
            url       : 'https://api.guildwars2.com/v2/materials',
            method    : 'get'
        });

        let craftingIds = JSON.parse(response.body);

        //console.log(craftingIds);

        for (craftingId of craftingIds) {
            // Pull all current items from prices api
            // let craftingItemsList = await httpRequest({
            //     host: 'api.guildwars2.com',
            //     port: 443,
            //     method: 'GET',
            //     path: `/v2/materials/${craftingId}`
            // });

            response = await limiter.request({
                url       : `https://api.guildwars2.com/v2/materials/${craftingId}`,
                method    : 'get'
            });
            
            let craftingItemsList = JSON.parse(response.body);

            let itemIds = [];

            if (craftingItemsList.items) {
                itemIds = craftingItemsList.items;
            }

            // For each item, validate whether its worth checking and evaluate it
            for (itemId of itemIds) {
                 await evaluateItem(itemId);
            }
        }
    } catch(err) {
        console.error(err);
    }

    restartService();
}

async function evaluateItem(id) {
    // let itemInfo = await httpRequest({
    //     host: 'api.guildwars2.com',
    //     port: 443,
    //     method: 'GET',
    //     path: `/v2/items/${id}`
    // });

    let response = await limiter.request({
        url       : `https://api.guildwars2.com/v2/items/${id}`,
        method    : 'get'
    });
    
    let itemInfo = JSON.parse(response.body);

    let flags = itemInfo.flags;
    let found = flags.find((element) => {
        return (element === 'NoSell');
    });
    if (found) return;

    // let itemPrices = await httpRequest({
    //     host: 'api.guildwars2.com',
    //     port: 443,
    //     method: 'GET',
    //     path: `/v2/commerce/prices/${id}`
    // });

    response = await limiter.request({
        url       : `https://api.guildwars2.com/v2/commerce/prices/${id}`,
        method    : 'get'
    });

    let itemPrices = JSON.parse(response.body);

    //console.log(itemInfo);

    if (itemPrices.buys.quantity > 10000 && itemPrices.sells.quantity > 10000) {
        // save to firebase
        console.log(itemPrices.buys.quantity);
        console.log(itemPrices.sells.quantity);

    } else {
        return;
    }
}

function saveToFirebase() {

}

function restartService() {
    // Set timeout for 15 minutes (?) and call runService
    setTimeout(runService, 10000);
    console.log('loopin');
}

// function httpRequest(params, postBody) {
//     //let _params = params;
//     return new Promise((resolve, reject) => {
//         let req = https.request(params, (res) => {
//             if (res.statusCode < 200 || res.statusCode >= 300) {
//                 return reject(new Error(`Unexpected ${res.statusCode} hitting ${params.path}`));
//             }
//             let body = [];

//             res.on('data', (chunk) => {
//                 body.push(chunk);
//             })

//             res.on('end', () => {
//                 try {
//                     body = JSON.parse(Buffer.concat(body).toString());
//                 } catch(err) {
//                     reject(err);
//                 }

//                 resolve(body);
//             });
//         });

//         req.on('error', (err) => {
//             reject(err);
//         });

//         if (postBody) {
//             req.write(postBody);
//         }

//         req.end();
//     });
// }

runService();