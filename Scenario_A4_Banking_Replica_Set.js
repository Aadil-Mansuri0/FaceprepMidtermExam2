// Scenario A4: Banking App - Building and Checking a Replica Set
// Replica set: rs0
// Database: bank
// Collection: accounts


// Requirement 1: Start three mongod instances with replica set name rs0
// and initiate the replica set.
// Replication keeps copies of data on multiple servers and provides
// availability if one server fails.

// Run these commands in three separate terminals:
//
// mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-1
// mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-2
// mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-3
//
// Connect to MongoDB:
// mongosh "mongodb://localhost:27017"

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});

// Output command:
rs.status().ok;

// Output:
/*
1

After a few seconds, one member becomes PRIMARY
and the other two members become SECONDARY.
*/


// Requirement 2: Find out which member is PRIMARY and
// which members are SECONDARY.

rs.status();

// Output command:
rs.status().members.map(member => ({
  name: member.name,
  state: member.stateStr,
  health: member.health
}));

// Output:
/*
[
  { name: "localhost:27017", state: "PRIMARY", health: 1 },
  { name: "localhost:27018", state: "SECONDARY", health: 1 },
  { name: "localhost:27019", state: "SECONDARY", health: 1 }
]

The PRIMARY port may be different after an election.
*/


// Requirement 3: Insert an account document using write concern
// w: "majority" so the data is safe on most members.

use("bank");

db.accounts.insertOne(
  {
    accNo: 1001,
    holder: "Kumar",
    balance: 5000
  },
  {
    writeConcern: {
      w: "majority",
      wtimeout: 5000,
      j: true
    }
  }
);

// Output command:
db.accounts.findOne({ accNo: 1001 });

// Output:
/*
{
  _id: ObjectId("..."),
  accNo: 1001,
  holder: "Kumar",
  balance: 5000
}
*/


// Requirement 4: Set read preference to secondaryPreferred
// and read the account back.

db.getMongo().setReadPref("secondaryPreferred");

db.accounts.findOne({ accNo: 1001 });

// Output command:
db.getMongo().getReadPrefMode();
db.accounts.findOne({ accNo: 1001 });

// Output:
/*
"secondaryPreferred"

{
  _id: ObjectId("..."),
  accNo: 1001,
  holder: "Kumar",
  balance: 5000
}
*/


// Requirement 5: Look at the oplog entry created by your insert.

db.getSiblingDB("local").getCollection("oplog.rs")
  .find()
  .sort({ $natural: -1 })
  .limit(5);

// Output command:
db.getSiblingDB("local").getCollection("oplog.rs")
  .find({ ns: "bank.accounts" })
  .sort({ $natural: -1 })
  .limit(5);

// Output:
/*
{
  ts: Timestamp(...),
  t: NumberLong(...),
  h: NumberLong(...),
  v: 2,
  op: "i",
  ns: "bank.accounts",
  o: {
    _id: ObjectId("..."),
    accNo: 1001,
    holder: "Kumar",
    balance: 5000
  }
}
*/


// Requirement 6: Force the primary to step down and observe
// how a new primary is elected.

// Run this command separately while connected to the PRIMARY:
rs.stepDown(60);

// Reconnect to the replica set after the primary steps down:
//
// mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"

// Output command (after reconnecting):
rs.status().members.map(member => ({
  name: member.name,
  state: member.stateStr,
  health: member.health
}));

// Output:
/*
The old PRIMARY steps down.
An eligible SECONDARY is elected as the new PRIMARY.
The PRIMARY port depends on the election.
*/


// Requirement 7: Check replication health using rs.status()
// and check the replication lag of the SECONDARY members.

rs.status();
rs.printSecondaryReplicationInfo();

// Output command:
rs.status();
rs.printSecondaryReplicationInfo();

// Output:
/*
rs.status() shows one PRIMARY and two SECONDARY members.
The health value of each healthy member is 1.

rs.printSecondaryReplicationInfo() displays the replication delay
of each SECONDARY member.
*/
