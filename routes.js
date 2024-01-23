"use strict";

const express = require("express");
const { asyncHandler } = require("./middleware/async-handler");
const User = require('./models').User;
const Course = require('./models').Course;

// Construct a router instance.
const router = express.Router();

// Route that returns a list of users.
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    let users = await User.findAll();
    res.json(users);
  })
);

// Route that creates a new user.
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).setHeader('Location', '/').json({ message: "Account successfully created!" });
    } catch (error) {
      console.log("ERROR: ", error.name);

      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
