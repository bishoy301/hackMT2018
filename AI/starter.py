# Gettin Goin

import requests, sys
from bs4 import BeautifulSoup as bs


gw2API =  "https://api.guildwars2.com"
req = ["/v2/materials"]

materialIds = requests.get((gw2API+req)).json()

print(materialsIds)
