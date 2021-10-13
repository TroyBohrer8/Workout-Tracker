const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const logger = require("morgan");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

app.get("/exercise", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/exercise.html"));
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/stats.html"));
});

app.post("/api/workouts", (req, res) => {
  db.Workout.create({})
    .then((dbWorkout) => {
      res.json(dbWorkout);
    })
    .catch(({ message }) => {
      console.log(message);
    });
});

app.put("/api/workouts/:id", ({ params, body }, res) => {
  console.log("PARAMS", body, params);

  db.Workout.findOneAndUpdate(
    { _id: params.id },
    { $push: { exercises: body } },
    { new: true }
  )
    .then((dbWorkout) => {
      res.json(dbWorkout);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.put("/api/workouts/:id",({body,params},res)=>{   
  Workout.findByIdAndUpdate(  
   params.id,
   {$push: { exercises:body } },
   {new: true, runValidators: true }
  )
  .then(data => res.json(data))
  .catch(err => { 
      res.json(err)
  })
});

app.get("/api/workouts", (req, res) => {
	db.Workout.aggregate([
		{
			$addFields: {
				totalDuration: { $sum: "$exercises.duration" },
			},
		},
	])
		.then((dbWorkouts) => {
			res.json(dbWorkouts);
		})
		.catch((err) => {
			res.json(err);
		});
});

app.get("/api/workouts/range", function (req, res) {
	db.Workout.aggregate([
		{
			$addFields: {
				totalDuration: { $sum: "$exercises.duration" },
				dateDifference: {
					$subtract: [new Date(), "$day"],
				},
			},
		},
	]).then(function (dbWorkouts) {
		res.json(dbWorkouts);
	});
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
