"use strict";

const express = require("express");
const { asyncHandler } = require("./middleware/async-handler");
const User = require("./models").User;
const Course = require("./models").Course;
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

/**
 * Users Routes
 */

// Route that returns all properties and values for the currently authenticated User 
// along with a 200 HTTP status code.
router.get("/users", authenticateUser, asyncHandler(async (req, res) => {
  const authenticatedUser = req.currentUser;
  const userProperties = await User.findOne({
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
    where: { id: authenticatedUser.id }
  });
  res.status(200).json(userProperties);
  })
);

// Route that creates a new user.
router.post("/users", asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res
        .status(201)
        .setHeader("Location", "/")
        .end();
    } catch (error) {
      console.log("ERROR: ", error);

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
router.get("/courses", asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        },
      ],
    });
    res.status(200).json(courses);
  })
);

// GET individual course detail
router.get("/courses/:id", asyncHandler(async (req, res, next) => {
    const course = await Course.findOne({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded', 'userId'],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        },
      ],
      where: { id: req.params.id }
    });
    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  })
);

// POST route that will create a new course
router.post( "/courses", authenticateUser, asyncHandler(async (req, res) => {
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
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course;
  // retrieve the current authenticated user's information from the Request object's `currentUser` property:
  const user = req.currentUser;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
      // Confirming that the currently authenticated user is the owner of the requested course.
      const courseOwner = course.userId;
      const authenticatedUser = user.id;

      if (courseOwner === authenticatedUser) {
          // update the course object from the request body
          await course.update(req.body);
          // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
          res.status(204).end();
      } else {
        res.status(403).json({message: "User is not owner of the requested course"});
      }

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
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course;
  // retrieve the current authenticated user's information from the Request object's `currentUser` property:
  const user = req.currentUser;
  try {
    course = await Course.findByPk(req.params.id);
    if (course) {
      // Confirming that the currently authenticated user is the owner of the requested course.
      const courseOwner = course.userId;
      const authenticatedUser = user.id;

      if (courseOwner === authenticatedUser) {
        // Delete the course object
        await course.destroy();
        // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
        res.status(204).end();
      } else {
        res.status(403).json({message: "User is not owner of the requested course"});
      }
    } else {
      res.status(400).json({message: "Course not found"});
    }
  } catch (error) {
    console.log('Error: ', error);
  }

}));

module.exports = router;
