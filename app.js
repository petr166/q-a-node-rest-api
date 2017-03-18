'use strict';
const express = require('express');
const app = express();
const routes = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

app.use(morgan("dev"));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/qa");
const dbConnection = mongoose.connection;

dbConnection.on("error", function(err) {
  console.error("connection error: " + err);
});

dbConnection.once("open", function() {
  console.log("db connection successful");
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if(req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, DELETE");
    return res.status(200).json({});
  }

  next();
});

app.use("/questions", routes);

// catch 404
app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Express server is listening on port " + port);
});
