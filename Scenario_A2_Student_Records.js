/*
SCENARIO A2: STUDENT RECORDS — INSERT, QUERY, SORT AND PROJECT
Database: collegeDB
Collection: students
*/

// REQUIREMENT 1
// Insert the student Arun with _id: 101 and his subject-wise scores.

// COMMAND
db = db.getSiblingDB("collegeDB");
db.students.insertOne({
  _id: 101,
  name: "Arun",
  dept: "CSE",
  marks: 78,
  scores: [
    { subject: "DBMS", mark: 85 },
    { subject: "Maths", mark: 70 }
  ]
});

// OUTPUT
/*
{
  acknowledged: true,
  insertedId: 101
}
*/


// REQUIREMENT 2
// Try to insert another student with the same _id: 101.

// COMMAND
try {
  db.students.insertOne({
    _id: 101,
    name: "Duplicate Arun",
    dept: "CSE",
    marks: 80,
    scores: [
      { subject: "DBMS", mark: 80 },
      { subject: "Maths", mark: 80 }
    ]
  });
} catch (error) {
  print(error.message);
}

// OUTPUT
/*
E11000 duplicate key error collection: collegeDB.students
index: _id_ dup key: { _id: 101 }

The insert is rejected because MongoDB does not allow duplicate _id values.
*/


// REQUIREMENT 3
// Insert the remaining five students (102 to 106) using a single insertMany.

// COMMAND
db.students.insertMany([
  {
    _id: 102,
    name: "Bala",
    dept: "IT",
    marks: 66,
    scores: [
      { subject: "DBMS", mark: 60 },
      { subject: "Maths", mark: 72 }
    ]
  },
  {
    _id: 103,
    name: "Chitra",
    dept: "CSE",
    marks: 91,
    scores: [
      { subject: "DBMS", mark: 95 },
      { subject: "Maths", mark: 87 }
    ]
  },
  {
    _id: 104,
    name: "Divya",
    dept: "ECE",
    marks: 72,
    scores: [
      { subject: "DBMS", mark: 55 },
      { subject: "Maths", mark: 89 }
    ]
  },
  {
    _id: 105,
    name: "Eswar",
    dept: "IT",
    marks: 84,
    scores: [
      { subject: "DBMS", mark: 88 },
      { subject: "Maths", mark: 80 }
    ]
  },
  {
    _id: 106,
    name: "Farah",
    dept: "CSE",
    marks: 59,
    scores: [
      { subject: "DBMS", mark: 45 },
      { subject: "Maths", mark: 73 }
    ]
  }
]);

// OUTPUT
/*
{
  acknowledged: true,
  insertedIds: {
    '0': 102,
    '1': 103,
    '2': 104,
    '3': 105,
    '4': 106
  }
}
*/


// REQUIREMENT 4
// List all students who belong to the CSE department.

// COMMAND
db.students.find(
  { dept: "CSE" },
  { _id: 1, name: 1, dept: 1, marks: 1 }
).toArray();

// OUTPUT
/*
[
  { _id: 101, name: "Arun", dept: "CSE", marks: 78 },
  { _id: 103, name: "Chitra", dept: "CSE", marks: 91 },
  { _id: 106, name: "Farah", dept: "CSE", marks: 59 }
]
*/


// REQUIREMENT 5
// List students whose overall marks are 75 or more.

// COMMAND
db.students.find(
  { marks: { $gte: 75 } },
  { _id: 1, name: 1, marks: 1 }
).toArray();

// OUTPUT
/*
[
  { _id: 101, name: "Arun", marks: 78 },
  { _id: 103, name: "Chitra", marks: 91 },
  { _id: 105, name: "Eswar", marks: 84 }
]
*/


// REQUIREMENT 6
// List students who belong to either the CSE or the IT department.

// COMMAND
db.students.find(
  { dept: { $in: ["CSE", "IT"] } },
  { _id: 1, name: 1, dept: 1, marks: 1 }
).toArray();

// OUTPUT
/*
[
  { _id: 101, name: "Arun", dept: "CSE", marks: 78 },
  { _id: 102, name: "Bala", dept: "IT", marks: 66 },
  { _id: 103, name: "Chitra", dept: "CSE", marks: 91 },
  { _id: 105, name: "Eswar", dept: "IT", marks: 84 },
  { _id: 106, name: "Farah", dept: "CSE", marks: 59 }
]
*/


// REQUIREMENT 7
// Find students who scored more than 80 in DBMS.
// Subject and mark must match the same array element.

// COMMAND
db.students.find(
  {
    scores: {
      $elemMatch: {
        subject: "DBMS",
        mark: { $gt: 80 }
      }
    }
  },
  { _id: 1, name: 1, scores: 1 }
).toArray();

// OUTPUT
/*
[
  {
    _id: 101,
    name: "Arun",
    scores: [
      { subject: "DBMS", mark: 85 },
      { subject: "Maths", mark: 70 }
    ]
  },
  {
    _id: 103,
    name: "Chitra",
    scores: [
      { subject: "DBMS", mark: 95 },
      { subject: "Maths", mark: 87 }
    ]
  },
  {
    _id: 105,
    name: "Eswar",
    scores: [
      { subject: "DBMS", mark: 88 },
      { subject: "Maths", mark: 80 }
    ]
  }
]
*/


// REQUIREMENT 8
// Show only the name and marks of the top 3 students, highest marks first.
// Hide the _id field.

// COMMAND
db.students.find(
  {},
  { _id: 0, name: 1, marks: 1 }
).sort({ marks: -1 }).limit(3).toArray();

// OUTPUT
/*
[
  { name: "Chitra", marks: 91 },
  { name: "Eswar", marks: 84 },
  { name: "Arun", marks: 78 }
]
*/
