# Gettin Goin

import requests, sys, datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from scipy.sparse import coo_matrix
from sklearn.utils import shuffle
import numpy as np
#import pandas as pd
#import matplotlib.pyplot as plt
#import seaborn as sns
print(datetime.datetime.now())
gw2API =  "https://api.guildwars2.com/v2"                   # append { materials, materials/catNum }
spidyAPI = "http://www.gw2spidy.com/api/v0.9/json/listings" # append { itemIdNum/buy-OR-sell/page }
req = ["/materials", "/buy/1", "/sell/1"]

# BEGINNING OF TIME INTERVAL
materialCats = requests.get((gw2API+req[0])).json()
buyCount = 0
sellCount = 0
nothingCount = 0
#print("All IDS:")

ids = set()     # These are al the items we will be analyzing
for x in range(len(materialCats)):
    tempIds = requests.get((gw2API + req[0] + '/' + str(materialCats[x]))).json()
    for y in range(len(tempIds['items'])):
        ids.add(tempIds['items'][y])

#print("Amount: ", len(ids))
#print(ids)
ids = list(ids)
numItems = len(ids)

# Now we look up each item by its id, both sell and buy listings.
# FOR EACH ITEM...
    # BUY------------------------------------------------------------------------
# Let's do this with **** ONE ITEM ****
for i in range(numItems):
    sellPredicted = 0
    buyPredicted = 0
    print("Item: ", ids[i], ' - ', i,'--------------------')
    try:
        buyList = requests.get((spidyAPI + '/' + str(ids[i]) + req[1] )).json()['results']
    except:
        pass
    avgSum = 0
    totalEntries = len(buyList)
    if (totalEntries == 0):
        print("Not enough data")
        print()
        buyList = ''
        continue
    #print()
    #print("URL: ", spidyAPI + '/' + str(ids[1]) + req[1]  )
    #print("BUY - Looking for Those Low Low Prices Ya'll")
    for x in range(totalEntries):
        # Add day of the week while we are here
        buyList[x]['dow'] = \
        datetime.date( \
        int(buyList[x]['listing_datetime'][0:4]), \
        int(buyList[x]['listing_datetime'][5:7]), \
        int(buyList[x]['listing_datetime'][8:10])).weekday()

        buyList[x]['time'] = \
        int( (buyList[x]['listing_datetime'][11:13] + \
        buyList[x]['listing_datetime'][14:16] + \
        buyList[x]['listing_datetime'][17:19]))

        avgSum += buyList[x]['unit_price']
        #print(buyList[x]['unit_price'], ' - ', buyList[x]['dow'], end=', ')
        averagePrice = avgSum/totalEntries
        #print("Average Price: ", averagePrice)

        # Now to classify the data - we are looking for the valleys, the minimum "peaks" that are
        # also below the average price. They will be classified as 1, everthing else 0.
        buyMatrix = []
        buyClasses = []

    for x in range(1, totalEntries-1):
        prevVal = buyList[x-1]['unit_price']
        currVal = buyList[x]['unit_price']
        nextVal = buyList[x+1]['unit_price']

        item = [currVal, buyList[x]['quantity'], buyList[x]['dow'], buyList[x]['time']]
        buyMatrix.append(item)

        if ((prevVal > currVal) and \
        (nextVal > currVal) and \
        (prevVal < averagePrice) and \
        (currVal < averagePrice) and \
        (nextVal < averagePrice)) or \
        (currVal < (0.95 * averagePrice)):
            buyClasses.append(1)
        else:
            buyClasses.append(0)

#for x in range(1, totalEntries-2):
#    print(buyMatrix[x],end=', ')
#print('Buy Classified')
#print()

# END OF BUY ---------------------------------------------------------------------

    # SELL------------------------------------------------------------------------

    sellList = requests.get((spidyAPI + '/' + str(ids[i]) + req[2] )).json()['results']
    avgSum = 0
    totalEntries = len(sellList)
#print("Item: ", ids[1])
#print("URL: ", spidyAPI + '/' + str(ids[1]) + req[2]  )
#print("SELL - Looking for Those High Prices Now Ya'll")
    for x in range(totalEntries):
    # Add day of the week while we are here
        sellList[x]['dow'] = \
        datetime.date( \
        int(sellList[x]['listing_datetime'][0:4]), \
        int(sellList[x]['listing_datetime'][5:7]), \
        int(sellList[x]['listing_datetime'][8:10])).weekday()

        sellList[x]['time'] = \
        int( (sellList[x]['listing_datetime'][11:13] + \
        sellList[x]['listing_datetime'][14:16] + \
        sellList[x]['listing_datetime'][17:19]))

        avgSum += sellList[x]['unit_price']
    # print(sellList[x]['unit_price'], ' - ', sellList[x]['dow'], end=', ')
    averagePrice = avgSum/totalEntries

#print("Average Price: ", averagePrice)

# Now to classify the data - we are looking for the maximumpeaks that are
# also above the average price. They will be classified as 1, everthing else 0.
# Initializing classes
    sellMatrix = []
    sellClasses = []

    for x in range(1, totalEntries-1):
        prevVal = sellList[x-1]['unit_price']
        currVal = sellList[x]['unit_price']
        nextVal = sellList[x+1]['unit_price']

        item = [currVal, sellList[x]['quantity'], sellList[x]['dow'], sellList[x]['time']]
        sellMatrix.append(item)

        if ((prevVal < currVal) and \
        (nextVal < currVal) and \
        (prevVal > averagePrice) and \
        (currVal > averagePrice) and \
        (nextVal > averagePrice)) or \
        (currVal > (1.05 * averagePrice)):
            sellClasses.append(2)
        else:
            sellClasses.append(0)

#for x in range(1, totalEntries-2):
#    print(sellMatrix[x],end=', ')

#print('Sell Classified')
#print()


# All of the data we have collected and classified will be used to TRAIN 2 models (one for buy,
# one for sell) with which we will make predictions. We will be using sci-kit learn to create this model.

## -- Training with sci-kit learn (DO NOT include index item[0], this is the one we will be
##    making a prediction on) --
## OK Here we go....

# BUY ****
#print("Before:\t", buyMatrix[0], buyClasses[0])
    buyX_sparse = coo_matrix(buyMatrix)
    buyMatrix, buyX_sparse, buyClasses = shuffle(buyMatrix, buyX_sparse, buyClasses, random_state=0)
#print("After:\t", buyMatrix[0], buyClasses[0])

    try:
        buyX_train, buyX_test, buyY_train, buyY_test = \
        train_test_split(buyMatrix, buyClasses, test_size=0.95, stratify=buyClasses, random_state=123456)
    except:
        continue
#print("BUY Train/Test Split Complete")

    rf = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=123456)
    rf.fit(buyX_train, buyY_train)

    predicted = rf.predict(buyX_test)
#print(buyX_test)
    accuracy = accuracy_score(buyY_test, predicted)
#print(f'BUY Out-of-bag score estimate: {rf.oob_score_:.3}')
#print(f'BUY Mean accuracy score: {accuracy:.3}')
#print()
#buyXtoPredict = []
    buyXtoPredict = np.array([buyList[0]['unit_price'], buyList[0]['quantity'], buyList[0]['dow'], buyList[0]['time']])
#buyXtoPredict.append(item)
#print(buyXtoPredict)
#print()
    buyPredicted = rf.predict(buyXtoPredict.reshape(1,-1))
    if(buyPredicted):
        print('BUY!')
        buyCount += 1


# SELL ****
#print("Before:\t", sellMatrix[0], sellClasses[0])
    sellX_sparse = coo_matrix(sellMatrix)
    sellMatrix, sellX_sparse, sellClasses = shuffle(sellMatrix, sellX_sparse, sellClasses, random_state=0)
#print("After:\t", sellMatrix[0], sellClasses[0])

    try:
        sellX_train, sellX_test, sellY_train, sellY_test = \
        train_test_split(sellMatrix, sellClasses, test_size=0.95, stratify=sellClasses, random_state=123456)
    except:
        continue
#print("SELL Train/Test Split Complete")

    rf = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=123456)
    rf.fit(sellX_train, sellY_train)

    predicted = rf.predict(sellX_test)
    accuracy = accuracy_score(sellY_test, predicted)
#print(f'SELL Out-of-bag score estimate: {rf.oob_score_:.3}')
#print(f'SELL Mean accuracy score: {accuracy:.3}')
#print()
#sellXtoPredict = []
    sellXtoPredict = np.array([sellList[0]['unit_price'], sellList[0]['quantity'], sellList[0]['dow'], sellList[0]['time']])
#sellXtoPredict.append(item)
#print(buyXtoPredict)
#print()
    sellPredicted = rf.predict(sellXtoPredict.reshape(1,-1))
    if (sellPredicted):
        print('SELL!')
        sellCount += 1

    if ( not sellPredicted ) and ( not buyPredicted ):
        print('Do Nothing')
        nothingCount += 1

    print()


print('Items:', numItems)
print('Buy: ', buyCount)
print('Sell: ', sellCount)
print('Do Nothing:', nothingCount)

print(datetime.datetime.now())
## Take latest listing from Spidy (which is the 0 index from our original request)
## and plug it into the model to test for class. Based on class result, update the status in the DB
## The front end will use this status to display if the user whould buy or sell right now.
## If taken from spidy the FIRST entry will be the most recent entry, and we will test it against the model.
## Therefore we will EXCLUDE that point from training.

# *** To pass on to the DB:
# look up ID number, update status & average price

# Rinse & Repeat FOR EACH Item

# Rinse & Repeat FOR TIME Interval'''
