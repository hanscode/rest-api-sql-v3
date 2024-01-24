"use strict";

const express = require("express");
const { asyncHandler } = require("./middleware/async-handler");
const User = require("./models").User;
const Course = require("./models").Course;

// Construct a router instance.
const router = express.Router();

/**
 * Users Routes
 */

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
      res
        .status(201)
        .setHeader("Location", "/")
        .json({ message: "Account successfully created!" });
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

/**
 * Courses Routes
 */

// Send a GET request to /courses to return all courses
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
        },
      ],
    });
    res.status(200).json(courses);
  })
);

// GET individual course detail
router.get(
  "/courses/:id",
  asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  })
);

// POST route that will create a new course
router.post(
  "/courses",
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).setHeader("Location", `/courses/${course.id}`).end();
    } catch (error) {
      console.log('Error: ', error);

      // checking the error
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        // error caught in the asyncHandler's catch block
        throw error;
      }
    }
  })
);

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', asyncHandler(async (req, res) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
      // update the course object from the request body
      await course.update(req.body);
      // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
      res.status(204).end();
    } else {
      res.status(400).json({message: "Course not found"});
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }

}));

// DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', asyncHandler(async (req, res) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
      // Delete the course object
      await course.destroy();
      // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
      res.status(204).end();
    } else {
      res.status(400).json({message: "Course not found"});
    }
  } catch (error) {
    console.log('Error: ', error);
  }

}));

module.exports = router;
