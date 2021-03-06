const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');

mongoose.set('useFindAndModify', false);

// Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load Profile Model
const profile = require('../../models/Profile');

// Load User Model
const user = require('../../models/User');

// @route GET api/profile/handle/:handle
// @desc GET profile by handle
// @access public

router.get('/handle/:handle', (req, res) => {
	const errors = {};

	Profile.findOne({
			handle: req.params.handle
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json({
			profile: 'There is no profile for this user!'
		}));
});

// @route GET api/profile/user/:user_id
// @desc GET profile by user ID
// @access public

router.get('/user/:user_id', (req, res) => {
	const errors = {};

	Profile.findOne({
			user: req.params.user_id
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json({
			profile: 'There is no profile for this user!'
		}));
});

// @route GET api/profile/all
// @desc Get current all profiles
// @access Private

router.get('/all', (req, res) => {
	const errors = {};

	Profile.find()
		.populate('user', ['name', 'avatar'])
		.then(profiles => {
			if (!profiles) {
				errors.noprofile = 'There are no profiles';
				res.status(404).json(errors)
			}
			res.json(profiles);
		})
		.catch(err => res.status(404).json({
			profiles: "There are no profiles"
		}));
});

// @route GET api/profile
// @desc Get current users profile
// @access Private

// use passport for private (protected route)
router.get('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	const errors = {};

	Profile.findOne({
			user: req.user.id
		})
		.populate('user', ['name', 'avatar'])
		.then(profile => {
			if (!profile) {
				errors.noprofile = 'There is no profile for this user';
				return res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json(err));
});

// @route GET api/profile/experience
// @desc Add experience to profile
// @access Private

router.post('/education', passport.authenticate('jwt', { session: false}), (req, res) => {

	// // it is not currently working

	// const {
	// 	errors,
	// 	isValid
	// } = validateEducationInput(req.body);

	// // Check validation
	// if (!isValid) {
	// 	// return any errors with 400 status
	// 	return res.status(400).json(errors);
	// }
	
	Profile.findOne({ user: req.user.id})
	.then(profile => {
		const newEdu = {
			school: req.body.school,
			degree: req.body.degree,
			study: req.body.study,
			from: req.body.from,
			to: req.body.to,
			fieldofstudy: req.body.fieldofstudy,
			current: req.body.current,
			description: req.body.description
		};

		// Add to exp array
		profile.education.unshift(newEdu);
		profile.save().then(profile => res.json(profile));
	})
})

// @route GET api/profile/experience
// @desc Add experience to profile
// @access Private

router.post('/experience', passport.authenticate('jwt', { session: false}), (req, res) => {

	// it is not currently working

	// const {
	// 	errors,
	// 	isValid
	// } = validateExperienceInput(req.body);

	// // Check validation
	// if (!isValid) {
	// 	// return any errors with 400 status
	// 	return res.status(400).json(errors);
	// }
	
	Profile.findOne({ user: req.user.id})
	.then(profile => {
		const newExp = {
			title: req.body.title,
			company: req.body.company,
			location: req.body.location,
			from: req.body.from,
			to: req.body.to,
			current: req.body.current,
			description: req.body.description
		};

		// Add to exp array
		profile.experience.unshift(newExp);
		profile.save().then(profile => res.json(profile));
	})
})



// @route POST api/profile
// @desc Create or edit user profile
// @access Private

router.post('/', passport.authenticate('jwt', {
	session: false
}), (req, res) => {
	// Get fields
	const {
		errors,
		isValid
	} = validateProfileInput(req.body);

	// Check validation
	if (!isValid) {
		// return any errors with 400 status
		return res.status(400).json(errors);
	}
	const profileFields = {};
	profileFields.user = req.user.id;

	// Check to see if fields are sent by the form
	if (req.body.handle) profileFields.handle = req.body.handle;
	if (req.body.company) profileFields.company = req.body.company;
	if (req.body.website) profileFields.website = req.body.website;
	if (req.body.location) profileFields.location = req.body.location;
	if (req.body.status) profileFields.status = req.body.status;
	if (req.body.bio) profileFields.bio = req.body.bio;
	if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

	// Skills - Split into array - it comes as comma separated values
	if (typeof req.body.skills !== 'undefined') profileFields.skills = req.body.skills.split(',');

	// Social
	profileFields.social = {};
	if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
	if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
	if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
	if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
	if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

	Profile.findOne({
			user: req.user.id
		})
		.then(profile => {
			if (profile) {
				// console.log(`/api/profile: profile? => ${profile}`);
				// Update
				Profile.findOneAndUpdate({
						user: req.user.id
					}, {
						$set: profileFields
					}, {
						new: true
					})
					.then(profile => res.json(profile))

			} else {
				// Create

				// Check if handle exist
				//  console.log(`create user`);
				//  console.log(`/api/profile: profile? => ${profile}`);

				Profile.findOne({
						handle: profileFields.handle
					})
					.then(profile => {
						if (profile) {
							errors.handle = 'That handle already exists';
							res.status(400).json(errors);
						}

						//   console.log(`save profile`);
						// Save Profile
						new Profile(profileFields)
							.save()
							.then(profile => res.json(profile));

						// console.log(`save profile`);
					})
			}
		})
})


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