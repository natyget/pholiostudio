const express = require('express');
const knex = require('../../db/knex');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// GET /api/user/role - Get current user's role
router.get('/role', requireAuth, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.session.userId }).first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      role: user.role,
      userId: user.id
    });
  } catch (error) {
    console.error('[API/User] Error fetching user role:', error);
    return res.status(500).json({ error: 'Failed to fetch user role' });
  }
});

module.exports = router;

