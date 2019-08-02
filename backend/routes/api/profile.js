const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Model
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Test profile route
// @access Public

router.get('/test', (req, res) => res.json({msg: 'Profile works'}));

// @route GET api/profile/
// @desc Get current users profile
// @access Private

router.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors)
      }
      res.json(profile)
    })
    .catch(err => res.status(404).json(err))
})


// @route POST api/profile/
// @desc Create or update user profile
// @access Private

router.post('/', passport.authenticate('jwt', { session: false}), (req, res) => {
  const errors = {};
  
  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id; // logged user (incl avatar, email..)
  // Check to see if it is send from the form
  if (req.body.handle) {
    profileFields.handle = req.body.handle;
  }
  if (req.body.company) {
    profileFields.company = req.body.company ;
  }
  if (req.body.website) {
    profileFields.website = req.body.website;
  }
  if (req.body.location) {
    profileFields.location = req.body.location ;
  }
  if (req.body.bio) {
    profileFields.bio = req.body.bio;
  }
  if (req.body.status) {
    profileFields.status = req.body.status;
  }
  if (req.body.githubusername) {
    profileFields.githubusername = req.body.githubusername;
  }
  // Skills split into array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }
  // Social
  profileFields.social = {};
  if (req.body.youtube) {
    profileFields.social. youtube = req.body.youtube;
  }
  if (req.body.twitter) { 
    profileFields.social. twitter = req.body.twitter;
  }
  if (req.body.facebook) {
    profileFields.social. facebook = req.body.facebook;
  }
  if (req.body.instagram) {
    profileFields.social. instagram = req.body.instagram;
  }
  if (req.body.linkedin) {
    profileFields.social. linkedin = req.body.linkedin;
  }
  
})


module.exports = router;