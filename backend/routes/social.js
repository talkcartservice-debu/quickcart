const express = require('express');
const router = express.Router();
const { 
  googleAuth,
  googleAuthCallback,
  facebookAuth,
  facebookAuthCallback,
  twitterAuth,
  twitterAuthCallback,
  shareToSocialMedia,
  getSocialShareUrl,
  getSocialPlatforms
} = require('../controllers/socialController');
const { protect: auth } = require('../middleware/auth');

// OAuth routes (these would be used with passport)
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

router.get('/auth/facebook', facebookAuth);
router.get('/auth/facebook/callback', facebookAuthCallback);

router.get('/auth/twitter', twitterAuth);
router.get('/auth/twitter/callback', twitterAuthCallback);

// Social sharing routes
router.post('/share', auth, shareToSocialMedia);

// Get social share URL
router.get('/share-url', auth, getSocialShareUrl);

// Get available platforms
router.get('/platforms', auth, getSocialPlatforms);

module.exports = router;