# testing post

import requests, json
result = {'sellAverage':15, 'buyAverage':20, 'status':1, 'discount':0.16, 'timestamp':'2018-01-27 19:32:26' }
r = requests.post('http://localhost:3000/results/12134', data=result)
print(r.status_code)
