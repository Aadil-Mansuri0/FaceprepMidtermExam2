/*
SCENARIO A4: BANKING APP — BUILDING AND CHECKING A REPLICA SET
Replica Set: rs0
Database: bank
Collection: accounts
*/

// REQUIREMENT 1
// Start three mongod instances with replica set name rs0 and initiate the replica set.

// COMMANDS
/*
Open three separate terminals and run:

mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-1
mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-2
mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-3

Connect using:
mongosh "mongodb://localhost:27017"
*/

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});

// OUTPUT
/*
{ ok: 1 }

After a few seconds, one member becomes PRIMARY and the other two become SECONDARY.
*/


// REQUIREMENT 2
// Find out which member is PRIMARY and which members are SECONDARY.

// COMMAND
rs.status();

// OUTPUT
/*
Check the members array in the result.
Example (the PRIMARY port can vary):

localhost:27017  PRIMARY    health: 1
localhost:27018  SECONDARY  health: 1
localhost:27019  SECONDARY  health: 1

There is one PRIMARY and two SECONDARY members when all nodes are healthy.
*/


// REQUIREMENT 3
// Insert an account document using write concern w: "majority".

// COMMAND
db = db.getSiblingDB("bank");
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

// OUTPUT
/*
{
  acknowledged: true,
  insertedId: ObjectId("...")
}
*/


// REQUIREMENT 4
// Set read preference to secondaryPreferred and read the account back.

// COMMAND
db.getMongo().setReadPref("secondaryPreferred");
db.accounts.findOne({ accNo: 1001 });

// OUTPUT
/*
{
  _id: ObjectId("..."),
  accNo: 1001,
  holder: "Kumar",
  balance: 5000
}

Read preference mode: secondaryPreferred
*/


// REQUIREMENT 5
// Look at the oplog entry created by the insert.

// COMMAND
db.getSiblingDB("local").getCollection("oplog.rs")
  .find()
  .sort({ $natural: -1 })
  .limit(5);

// OUTPUT
/*
The latest oplog entries are displayed.
The insert entry has fields similar to:

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


// REQUIREMENT 6
// Force the current PRIMARY to step down and observe the new PRIMARY.

// COMMAND
/*
Run this command separately while connected to the current PRIMARY:

rs.stepDown(60)

Reconnect to the replica set:
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"
*/

// OUTPUT
/*
The old PRIMARY steps down.
MongoDB elects an eligible SECONDARY as the new PRIMARY.
The exact PRIMARY port may vary after the election.
*/


// REQUIREMENT 7
// Check replication health and the replication lag of SECONDARY members.

// COMMAND
rs.status();
rs.printSecondaryReplicationInfo();

// OUTPUT
/*
rs.status() displays the state and health of all replica-set members.

rs.printSecondaryReplicationInfo() displays the replication delay
of each SECONDARY member relative to the PRIMARY.

A healthy replica set normally has one PRIMARY and two SECONDARY
members, each with health: 1.
*/
