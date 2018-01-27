function runService() {
    // Pull all current items from prices api
    let items = [];

    // For each item, validate whether its worth checking and evaluate it
    items.forEach((item) => {
        evaluateItem();
    })

    restartService();
}

function evaluateItem() {
    
}

function getPrices() {

}

function saveToFirebase() {

}

function restartService() {
    // Set timeout for 15 minutes (?) and call runService
}

runService();