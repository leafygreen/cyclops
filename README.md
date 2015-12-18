# cyclops
Proxy server between Cloud|Ops Manager Agents and Servers with web application serving real time dashboard

```
Cloud Ops
CloudOps
ClOps
Cyclops
```

![Screenshot](http://s16.postimg.org/pt23g5yg5/Screen_Shot_2015_12_18_at_2_39_18_PM.png)

# To run:
* Clone cyclops onto a server near your automation agents
* Start MITM: cd mitm; go run mitm.go
* Update automation agents to point to cylops host on port 9090, e.g. http://myCyclops:9090
* Open the webapp: cd webapp/dist; open index.html

Screenshot
------------------------
![Screenshot](http://s16.postimg.org/5mqa509et/Screen_Shot_2015_12_18_at_12_03_07_PM.png)

# Contributers
* Dennis Kuczynski, @denniskuczynski
* Stephen Lee, @sl33nyc
* Peter Gravelle, @pcgMongo

## Shout Outs
cyclops is a [MongoDB](http://www.mongodb.com) Skunkworks Project

![Friendly Skunk](http://s12.postimg.org/fxmtcosx9/skunkworks2.jpg)
