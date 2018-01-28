# testing post

import requests, json
sellAverage = 32
result = {'sellAverage':sellAverage, 'buyAverage':252, 'status':2, 'discount':0.54, 'timestamp':'2018-01-27 19:32:26' }
r = requests.post('http://localhost:3000/results/12134', data=result)
print(r.status_code)
