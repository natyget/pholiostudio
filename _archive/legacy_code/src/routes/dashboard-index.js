const express = require('express');
const knex = require('../db/knex');

const router = express.Router();

// Helper function to determine dashboard redirect based on user role
function getDashboardRedirect(role) {
  if (role === 'TALENT') return '/dashboard/talent';
  if (role === 'AGENCY') return '/dashboard/agency';
  return '/';
}

// Redirect /dashboard to appropriate dashboard based on user role
router.get('/dashboard', async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session || !req.session.userId) {
      return res.redirect('/login');
    }
    
    // Get user role
    const user = await knex('users').where({ id: req.session.userId }).first();
    if (!user) {
      return res.redirect('/login');
    }
    
    // Redirect based on role - dashboard routes handle empty states internally
    return res.redirect(getDashboardRedirect(user.role));
  } catch (error) {
    console.error('[Dashboard] Error redirecting /dashboard:', error);
    // On error, try to redirect based on session role if available
    if (req.session && req.session.role) {
      return res.redirect(getDashboardRedirect(req.session.role));
    }
    return res.redirect('/login');
  }
});

module.exports = router;



