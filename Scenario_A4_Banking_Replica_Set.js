// Scenario A4: Banking App - Building and Checking a Replica Set
// Replica set: rs0 | Database: bank | Collection: accounts

// Requirement 1: Start three mongod instances and initiate the replica set.

// Commands to run in three separate terminals:
//
// mongod --replSet rs0 --port 27017 --dbpath C:\data\rs0-1
// mongod --replSet rs0 --port 27018 --dbpath C:\data\rs0-2
// mongod --replSet rs0 --port 27019 --dbpath C:\data\rs0-3
//
// Connect to one node:
// mongosh "mongodb://localhost:27017"

// Command:
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
});

// Output command:
printjson(rs.status().ok);

// Output:
/*
1
*/


// Requirement 2: Find which member is PRIMARY and which members are SECONDARY.

// Command:
rs.status();

// Output command:
printjson(
  rs.status().members.map(member => ({
    name: member.name,
    state: member.stateStr,
    health: member.health
  }))
);

// Output:
/*
[
  { name: "localhost:27017", state: "PRIMARY", health: 1 },
  { name: "localhost:27018", state: "SECONDARY", health: 1 },
  { name: "localhost:27019", state: "SECONDARY", health: 1 }
]
Note: The PRIMARY port may be different after election.
*/


// Requirement 3: Insert an account using write concern w: "majority".

// Command:
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


// Requirement 4: Set read preference to secondaryPreferred and read the account back.

// Command:
db.getMongo().setReadPref("secondaryPreferred");
db.accounts.findOne({ accNo: 1001 });

// Output command:
print("Read preference: " + db.getMongo().getReadPrefMode());
printjson(db.accounts.findOne({ accNo: 1001 }));

// Output:
/*
Read preference: secondaryPreferred
{
  _id: ObjectId("..."),
  accNo: 1001,
  holder: "Kumar",
  balance: 5000
}
*/


// Requirement 5: Look at the oplog entry created by the insert.

// Command:
db.getSiblingDB("local").getCollection("oplog.rs")
  .find()
  .sort({ $natural: -1 })
  .limit(5);

// Output command:
printjson(
  db.getSiblingDB("local").getCollection("oplog.rs")
    .find({ ns: "bank.accounts" })
    .sort({ $natural: -1 })
    .limit(5)
    .toArray()
);

// Output:
/*
[
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
]
*/


// Requirement 6: Force the current PRIMARY to step down and observe the new PRIMARY.

// Command (run separately on the current PRIMARY):
// rs.stepDown(60);

// Reconnect to the replica set:
// mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"

// Output command (after reconnecting):
printjson(
  rs.status().members.map(member => ({
    name: member.name,
    state: member.stateStr,
    health: member.health
  }))
);

// Output:
/*
The old PRIMARY steps down.
An eligible SECONDARY is elected as the new PRIMARY.
The exact PRIMARY port depends on the election.
*/


// Requirement 7: Check replica-set health and replication lag of SECONDARY members.

// Command:
rs.status();
rs.printSecondaryReplicationInfo();

// Output command:
printjson(
  rs.status().members.map(member => ({
    name: member.name,
    state: member.stateStr,
    health: member.health,
    optime: member.optimeDate
  }))
);
rs.printSecondaryReplicationInfo();

// Output:
/*
One PRIMARY and two SECONDARY members should be shown.
Each healthy member has health: 1.
The secondary replication information displays the time delay
between the PRIMARY and each SECONDARY.
*/
