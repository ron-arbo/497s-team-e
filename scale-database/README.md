In this project we will discuss how to horizontally scale database systems.
Horizontal scaling means adding more machines to the system to share the workload.
(Vertical scaling means adding more RAM/CPUs/Storage/Network capacity to the same machine, and it has more to do with the hardware update, so it won't be discussed here.)  

# Scale MongoDB
The data replica sets schema of MongoDB (which is same as the master-slaves model) is only for increasing data availability instead of increasing throughput. According to MongoDB: 
> "All members of a replica have roughly equivalent write traffic; as a result, secondaries will service reads at roughtly the same rate as the primary."

For MongoDB, horizontal scaling is accompished by sharding. 
In this case, a database is deployed to a cluster of servers. 
Internally, MongoDB splits data in each collection into several subsets/chunks, and each server in the cluster handles a subset of the data requests. 

For each server, MongoDB keeps a maxKey as the upper bound to the range of Shard Key it shall contains.
If the Shard Key is monotonical increasing, it is very likely that all inserts goes to the same chunk in one server, which makes sharding useless.
To solve this, MongoDB also introduces hashed Shard Key to evenly distribute workload, and it is recommended to use the default ObjectID (which is automatically generated using the timestamp of the data inserted) as the Shard Key. We will follow the recommendation here.
> The field you choose as your hashed shard key should have a good cardinality, or large number of different values. Hashed keys are ideal for shard keys with fields that change monotonically like ObjectId values or timestamps. A good example of this is the default _id field, assuming it only contains ObjectID values. 
Also,
> MongoDB automatically computes the hashes when resolving queries using hashed indexes. Applications do not need to compute hashes.

Simply put, the work need to be done here is choosing the Shard Key for each collection, and this Shard Key is likely the _id which is automatically generated by MongoDB.

## Code Explanation:
### How to initialize the service
In this directory, we demonstrate how to use and scale a sharded mongoDB.

First you need to set up the router, config server and main server instances.
#### In DB_master, run:
> sudo docker-compose up --build
#### This will set up the associated servers and create a network called "mongo_cluster"
#### Then, run
> sudo bash config.sh
#### The commands initialize the servers and connect them together. Now the DB is ready to go.
#### Simply hit enter after after each command to execute the next one.

Then, the db is set up and other microservices can use it once they join "mongo_cluster" network.
See the code in DB_express about how to join to the "mongo_cluster" network.
After join the network, use the link "mongodb://mongos1:27019" in your own microservices to connect to the sharded mongoDB.

### What is this code for
Considering the scenario when you have more than ten million users using the service.
As the number of users increases, the indexing need to be done might overwhelm a single server.
In this case you can use sharding to scale the system so the database is running on multiple servers.
What the script does is it creates a sharded service what can be augmented overtime.

For mongoDB, it now consists of three part:
1) Router
What redirect user request to different servers.
It is the mongos1 service in the docker-compose file.

2) Matedata
Which keep track of the relavent information of each server.
It is mongocfg services in in the docker-compose file.

3) Sharded Database
Each handles a segment of the original workload.
It is mongors1 and mongors2 services in in the docker-compose file.

For mongocfg, mongors1, and mongors2, each is made by three replica set of mongodb instance to increase avalability. 

Simply put, mongodb://mongos1:27019 is where all the other microservices should send request to.