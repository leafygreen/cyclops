# cyclops
Proxy server between Cloud|Ops Manager Agents and Servers with web application serving real time dashboard

```
Cloud Ops
CloudOps
ClOps
Cyclops
```

To run:
* Start a local copy of Cloud/Ops Manager
* Start MITM: cd mitm; go run mitm.go
* Start a local automation agent changing the conf url to "localhost:9090"
* Open the webapp: cd webapp/dist; open index.html
