# Gettin Goin

import requests, sys, datetime
#from bs4 import BeautifulSoup as bs


gw2API =  "https://api.guildwars2.com/v2"                   # append { materials, materials/catNum }
spidyAPI = "http://www.gw2spidy.com/api/v0.9/json/listings" # append { itemIdNum/buy-OR-sell/page }
req = ["/materials", "/buy/1", "/sell/1"]

materialCats = requests.get((gw2API+req[0])).json()

#print("All IDS:")

ids = set()     # These are al the items we will be analyzing
for x in range(len(materialCats)):
    tempIds = requests.get((gw2API + req[0] + '/' + str(materialCats[x]))).json()
    for y in range(len(tempIds['items'])):
        ids.add(tempIds['items'][y])

#print("Amount: ", len(ids))
#print(ids)
ids = list(ids)

# Now we look up each item by its id, both sell and buy listings.
# for every item...
    # BUY------------------------------------------------------------------------
# Let's do this with ONE ITEM
buyList = requests.get((spidyAPI + '/' + str(ids[1]) + req[1] )).json()['results']
avgSum = 0
totalEntries = len(buyList)
print("Item: ", ids[1])
print("URL: ", spidyAPI + '/' + str(ids[1]) + req[1]  )
print("BUY - Looking for Those Low Low Prices Ya'll")
for x in range(totalEntries):
    # Add day of the week while we are here
    buyList[x]['dow'] = \
    datetime.date( \
    int(buyList[x]['listing_datetime'][0:4]), \
    int(buyList[x]['listing_datetime'][5:7]), \
    int(buyList[x]['listing_datetime'][8:10])).weekday()

    avgSum += buyList[x]['unit_price']
    print(buyList[x]['unit_price'], ' - ', buyList[x]['dow'], end=', ')
averagePrice = avgSum/totalEntries
print()
print("Average Price: ", averagePrice)

# Now to classify the data - we are looking for the valleys, the minimum "peaks" that are
# also below the average price. They will be classified as 1, everthing else 0.
buyList[0]['class'] = 0
buyList[totalEntries-1]['class'] = 0
for x in range(1, totalEntries-1):
    prevVal = buyList[x-1]['unit_price']
    currVal = buyList[x]['unit_price']
    nextVal = buyList[x+1]['unit_price']

    if (prevVal > currVal) and \
    (nextVal > currVal) and \
    (prevVal < averagePrice) and \
    (currVal < averagePrice) and \
    (nextVal < averagePrice):
        buyList[x]['class'] = 1
    else:
        buyList[x]['class'] = 0

for x in range(totalEntries):
    print(buyList[x]['class'], end=', ')
print('END OF BUY')
print()

# END OF BUY ---------------------------------------------------------------------

    # SELL------------------------------------------------------------------------

sellList = requests.get((spidyAPI + '/' + str(ids[1]) + req[2] )).json()['results']
avgSum = 0
totalEntries = len(sellList)
print("Item: ", ids[1])
print("URL: ", spidyAPI + '/' + str(ids[1]) + req[2]  )
print("SELL - Looking for Those High Prices Now Ya'll")
for x in range(totalEntries):
    # Add day of the week while we are here
    sellList[x]['dow'] = \
    datetime.date( \
    int(sellList[x]['listing_datetime'][0:4]), \
    int(sellList[x]['listing_datetime'][5:7]), \
    int(sellList[x]['listing_datetime'][8:10])).weekday()

    avgSum += sellList[x]['unit_price']
    print(sellList[x]['unit_price'], ' - ', sellList[x]['dow'], end=', ')
averagePrice = avgSum/totalEntries
print()
print("Average Price: ", averagePrice)

# Now to classify the data - we are looking for the maximumpeaks that are
# also above the average price. They will be classified as 1, everthing else 0.
sellList[0]['class'] = 0
sellList[totalEntries-1]['class'] = 0
for x in range(1, totalEntries-1):
    prevVal = sellList[x-1]['unit_price']
    currVal = sellList[x]['unit_price']
    nextVal = sellList[x+1]['unit_price']

    if (prevVal < currVal) and \
    (nextVal < currVal) and \
    (prevVal > averagePrice) and \
    (currVal > averagePrice) and \
    (nextVal > averagePrice):
        sellList[x]['class'] = 1
    else:
        sellList[x]['class'] = 0

for x in range(totalEntries):
    print(sellList[x]['class'], end=', ')
print('END OF SELL')
print()


print()
print("Now that everything has been classified, this is what the final structure looks like:")
print("\tBuy listing:")
print("\t",buyList[0])
print()
print("\tSell listing:")
print("\t",sellList[0])
print()

# All of the data we have collected and classified will be used to TRAIN a model
# with which we will make predictions. We will be using tensorflow to create this model.

## -- Training with Tensorflow (DO NOT include index item[0], this is the one we will be 
##    making a prediction on)--

## Request latest listing from Spidy and plug it into the model to test for class.
## Based on class result, update the status in the DB
## The front end will use this status to display if the user whould buy or sell right now.
## If taken from spidy the FIRST entry will be the most recent entry, and we will test it against the model.
## Therefore we will EXCLUDE that point from training.

# Rinse & Repeat
