// Scenario A4: Banking App - Building and Checking a Replica Set
// Replica set: rs0 | Database: bank | Collection: accounts
//
// Requirement 1 - Start three mongod instances and initiate the replica set.
//
// Run the following in THREE separate terminal windows (Windows):
// mkdir C:\\data\\rs0-1
// mkdir C:\\data\\rs0-2
// mkdir C:\\data\\rs0-3
// mongod --replSet rs0 --port 27017 --dbpath C:\\data\\rs0-1
// mongod --replSet rs0 --port 27018 --dbpath C:\\data\\rs0-2
// mongod --replSet rs0 --port 27019 --dbpath C:\\data\\rs0-3
//
// On Linux/macOS, create three separate data directories and use:
// mongod --replSet rs0 --port 27017 --dbpath /data/rs0-1
// mongod --replSet rs0 --port 27018 --dbpath /data/rs0-2
// mongod --replSet rs0 --port 27019 --dbpath /data/rs0-3
//
// Connect using: mongosh "mongodb://localhost:27017"
//
// Initiate only once. If the replica set is already configured, continue
// to Requirement 2 instead of running rs.initiate() again.
try {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "localhost:27017" },
      { _id: 1, host: "localhost:27018" },
      { _id: 2, host: "localhost:27019" }
    ]
  });
} catch (error) {
  print("Replica set may already be initiated. Check rs.status().");
  print(error.message);
}

// Output command:
rs.status().ok;

// Expected output:
// 1
// After election: one PRIMARY and two SECONDARY members.


// Requirement 2 - Identify the PRIMARY and SECONDARY members.
rs.status();

// Output command:
rs.status().members.map(member => ({
  name: member.name,
  state: member.stateStr,
  health: member.health
}));

// Expected output (the PRIMARY port can vary):
// [
//   { name: "localhost:27017", state: "PRIMARY", health: 1 },
//   { name: "localhost:27018", state: "SECONDARY", health: 1 },
//   { name: "localhost:27019", state: "SECONDARY", health: 1 }
// ]


// Requirement 3 - Insert an account using majority write concern.
use("bank");

db.accounts.insertOne(
  { accNo: 1001, holder: "Kumar", balance: 5000 },
  { writeConcern: { w: "majority", wtimeout: 5000, j: true } }
);

// Output command:
db.accounts.findOne({ accNo: 1001 });

// Expected output:
// {
//   _id: ObjectId("..."),
//   accNo: 1001,
//   holder: "Kumar",
//   balance: 5000
// }


// Requirement 4 - Set secondaryPreferred and read the account.
db.getMongo().setReadPref("secondaryPreferred");
db.accounts.findOne({ accNo: 1001 });

// Output command:
db.getMongo().getReadPrefMode();
db.accounts.findOne({ accNo: 1001 });

// Expected output:
// "secondaryPreferred"
// { _id: ObjectId("..."), accNo: 1001, holder: "Kumar", balance: 5000 }


// Requirement 5 - Inspect the oplog entry created by the insert.
db.getSiblingDB("local").getCollection("oplog.rs")
  .find({ ns: "bank.accounts" })
  .sort({ $natural: -1 })
  .limit(5);

// Output command:
db.getSiblingDB("local").getCollection("oplog.rs")
  .find({ ns: "bank.accounts" })
  .sort({ $natural: -1 })
  .limit(5);

// Expected output (fields and timestamp vary):
// {
//   ts: Timestamp(...), t: NumberLong(...), h: NumberLong(...), v: 2,
//   op: "i",
//   ns: "bank.accounts",
//   o: { _id: ObjectId("..."), accNo: 1001, holder: "Kumar", balance: 5000 }
// }


// Requirement 6 - Force the current PRIMARY to step down.
// IMPORTANT: Run this command MANUALLY in a separate mongosh session
// connected to the current PRIMARY. It disconnects that shell, so it
// should not be run while loading this complete script.
//
// Command to perform requirement:
// rs.stepDown(60);
//
// Reconnect to the replica set:
// mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0"
//
// Output command (after reconnecting):
// rs.status().members.map(member => ({
//   name: member.name,
//   state: member.stateStr,
//   health: member.health
// }));
//
// Expected output:
// The former PRIMARY steps down. An eligible SECONDARY is elected
// as the new PRIMARY. The elected port may vary.


// Requirement 7 - Check replica-set health and secondary replication lag.
// Run these commands after reconnecting to the replica set:
rs.status();
rs.printSecondaryReplicationInfo();

// Output command:
rs.status();
rs.printSecondaryReplicationInfo();

// Expected output:
// rs.status() shows one PRIMARY and two SECONDARY members,
// with health: 1 for each healthy member.
// rs.printSecondaryReplicationInfo() displays the lag of each SECONDARY.
