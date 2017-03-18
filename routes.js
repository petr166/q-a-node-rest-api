'use strict';
const express = require('express');
const router = express.Router();
const Question = require('./models').Question;

router.param("qID", function(req, res, next, qID) {
  Question.findById(qID, function(err, doc) {
    if (err) return next(err);

    if(!doc) {
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }

    req.question = doc;
    next();
  });
});

router.param("aID", function(req, res, next, aID) {
  req.answer = req.question.answers.id(aID);

  if(!req.answer) {
    const err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }

  return next();
});


// GET /questions
// return all the questions
router.get("/", function(req, res, next) {
  Question.find({})
            .sort({createdAt: -1})
            .exec(function(err, questions) {
              if (err) return next(err);

              res.json(questions);
             });
});

// POST /questions
// create question
router.post("/", function(req, res, next) {
  const question = new Question(req.body);

  question.save(function(err, question) {
    if (err) return next(err);

    res.status(201);
    res.json(question);
  });
});

// GET /questions/:id
// return a specific question
router.get("/:qID", function(req, res, next) {
   res.json(req.question);
});

// POST /questions/:id/answers
// create answer
router.post("/:qID/answers", function(req, res, next) {
  req.question.answers.push(req.body);

  req.question.save(function(err, question) {
    if (err) return next(err);

    res.status(201);
    res.json(question);
  });
});

// PUT /questions/:id/answers/:id
// update answer
router.put("/:qID/answers/:aID", function(req, res, next) {
  req.answer.update(req.body, function(err, result) {
    if (err) return next(err);

    res.json(result);
  });
});

// DELETE /questions/:id/answers/:id
// delete answer
router.delete("/:qID/answers/:aID", function(req, res, next) {
  req.answer.remove(function(err) {
    req.question.save(function(err, question) {
      if (err) return next(err);

      res.json(question);
    });
  });
});

// POST /questions/:id/answers/:id/vote-up
// POST /questions/:id/answers/:id/vote-down
// vote answer
router.post("/:qID/answers/:aID/vote-:dir",
  function(req, res, next) {
    if (req.params.dir.search(/^(up|down)$/) === -1) {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
    } else {
      req.vote = req.params.dir;
      next();
    }
  },
  function(req, res, next) {
    req.answer.vote(req.vote, function(err, question) {
      if (err) return next(err);

      res.json(question);
   });
});

module.exports = router;
