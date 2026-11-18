// Scenario A2: Student Records
// Database: collegeDB
// Collection: students

use("collegeDB");

// Requirement 1: Insert the student Arun (_id: 101) with his scores array.

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

// Output command:
db.students.findOne({ _id: 101 });

// Output:
/*
{
  _id: 101,
  name: "Arun",
  dept: "CSE",
  marks: 78,
  scores: [
    { subject: "DBMS", mark: 85 },
    { subject: "Maths", mark: 70 }
  ]
}
*/


// Requirement 2: Try to insert another student with the same _id: 101.
// Read the error message and explain what happens.

try {
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
} catch (e) {
  print(e.message);
}

// Output command:
db.students.find({ _id: 101 });

// Output:
/*
E11000 duplicate key error: duplicate _id value 101

The second document is not inserted because _id must be unique.
The original Arun document remains unchanged.
*/


// Requirement 3: Insert the remaining five students (102 to 106)
// using a single insertMany.

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

// Output command:
db.students.find(
  { _id: { $gte: 102, $lte: 106 } },
  { _id: 1, name: 1, dept: 1, marks: 1 }
).sort({ _id: 1 });

// Output:
/*
[
  { _id: 102, name: "Bala", dept: "IT", marks: 66 },
  { _id: 103, name: "Chitra", dept: "CSE", marks: 91 },
  { _id: 104, name: "Divya", dept: "ECE", marks: 72 },
  { _id: 105, name: "Eswar", dept: "IT", marks: 84 },
  { _id: 106, name: "Farah", dept: "CSE", marks: 59 }
]
*/


// Requirement 4: List all students of the CSE department.

db.students.find({ dept: "CSE" });

// Output command:
db.students.find(
  { dept: "CSE" },
  { _id: 1, name: 1, dept: 1, marks: 1 }
);

// Output:
/*
[
  { _id: 101, name: "Arun", dept: "CSE", marks: 78 },
  { _id: 103, name: "Chitra", dept: "CSE", marks: 91 },
  { _id: 106, name: "Farah", dept: "CSE", marks: 59 }
]
*/


// Requirement 5: List students whose overall marks are 75 or more.

db.students.find({ marks: { $gte: 75 } });

// Output command:
db.students.find(
  { marks: { $gte: 75 } },
  { _id: 1, name: 1, marks: 1 }
);

// Output:
/*
[
  { _id: 101, name: "Arun", marks: 78 },
  { _id: 103, name: "Chitra", marks: 91 },
  { _id: 105, name: "Eswar", marks: 84 }
]
*/


// Requirement 6: List students who belong to either the CSE or IT department.

db.students.find({ dept: { $in: ["CSE", "IT"] } });

// Output command:
db.students.find(
  { dept: { $in: ["CSE", "IT"] } },
  { _id: 1, name: 1, dept: 1, marks: 1 }
);

// Output:
/*
[
  { _id: 101, name: "Arun", dept: "CSE", marks: 78 },
  { _id: 102, name: "Bala", dept: "IT", marks: 66 },
  { _id: 103, name: "Chitra", dept: "CSE", marks: 91 },
  { _id: 105, name: "Eswar", dept: "IT", marks: 84 },
  { _id: 106, name: "Farah", dept: "CSE", marks: 59 }
]
*/


// Requirement 7: Find students who scored more than 80 in DBMS.
// Subject and mark must be satisfied by the same array element.

db.students.find({
  scores: {
    $elemMatch: {
      subject: "DBMS",
      mark: { $gt: 80 }
    }
  }
});

// Output command:
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
);

// Output:
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


// Requirement 8: Show only the name and marks of the top 3 students,
// highest marks first. Hide the _id field.

db.students.find(
  {},
  { _id: 0, name: 1, marks: 1 }
).sort({ marks: -1 }).limit(3);

// Output command:
db.students.find(
  {},
  { _id: 0, name: 1, marks: 1 }
).sort({ marks: -1 }).limit(3);

// Output:
/*
[
  { name: "Chitra", marks: 91 },
  { name: "Eswar", marks: 84 },
  { name: "Arun", marks: 78 }
]
*/
