const express = require('express');
const knex = require('../db/knex');
const { addMessage } = require('../middleware/context');

const router = express.Router();

// API: Search agencies for apply form dropdown
router.get('/api/agencies/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = (q || '').trim().toLowerCase();

    if (!searchQuery || searchQuery.length < 2) {
      return res.json([]);
    }

    // Search for verified agencies
    const agencies = await knex('users')
      .where({ role: 'AGENCY' })
      .where(function() {
        this.whereILike('agency_name', `%${searchQuery}%`)
          .orWhereILike('email', `%${searchQuery}%`);
      })
      .select('id', 'agency_name', 'email')
      .limit(10)
      .orderBy('agency_name', 'asc');

    return res.json(agencies.map(agency => ({
      id: agency.id,
      name: agency.agency_name || agency.email,
      email: agency.email
    })));
  } catch (error) {
    console.error('[Apply] Error searching agencies:', error);
    return res.status(500).json({ error: 'Failed to search agencies' });
  }
});

// Partner-led funnel: /apply/:agencySlug
// UPDATED: Redirects to new Casting Call system
router.get('/apply/:agencySlug', async (req, res) => {
  // /apply is only for logged-out users (new signups)
  // If user is logged in, redirect them to their dashboard
  if (req.session && req.session.userId && req.currentUser) {
    if (req.session.role === 'TALENT') {
      return res.redirect('/dashboard/talent');
    } else if (req.session.role === 'AGENCY') {
      return res.redirect('/dashboard/agency');
    } else {
      return res.redirect('/dashboard');
    }
  }

  const { agencySlug } = req.params;

  try {
    // Look up agency by slug
    const agency = await knex('users')
      .where({ 
        agency_slug: agencySlug,
        role: 'AGENCY'
      })
      .first();

    if (!agency) {
      addMessage(req, 'error', 'Agency not found. Redirecting to general application form.');
      return res.redirect('/apply');
    }

    // Store locked agency ID in session for casting call
    req.session.lockedAgencyId = agency.id;
    
    // Save session before redirecting
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('[Apply] Error saving session with lockedAgencyId:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Redirect to new Casting Call system (Vite frontend in dev)
    return res.redirect(process.env.NODE_ENV === 'production' ? '/onboarding' : 'http://localhost:5173/onboarding');
  } catch (error) {
    console.error('[Apply] Error loading agency:', error);
    addMessage(req, 'error', 'Error loading agency information. Redirecting to general application form.');
    return res.redirect('/apply');
  }
});

router.get('/apply', async (req, res, next) => {
  try {
    // If user is logged in and has profile, redirect to dashboard or onboarding
    if (req.session && req.session.userId && req.currentUser) {
      if (req.session.role === 'TALENT') {
        // Check if onboarding completed
        const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
        if (profile && !profile.onboarding_completed_at) {
          // Redirect to Vite frontend in development
          return res.redirect(process.env.NODE_ENV === 'production' ? '/onboarding' : 'http://localhost:5173/onboarding');
        }
        return res.redirect('/dashboard/talent');
      } else if (req.session.role === 'AGENCY') {
        return res.redirect('/dashboard/agency');
      } else {
        return res.redirect('/dashboard');
      }
    }

    // Not logged in - redirect to Vite frontend (casting call)
    return res.redirect(process.env.NODE_ENV === 'production' ? '/onboarding' : 'http://localhost:5173/onboarding');
  } catch (error) {
    return next(error);
  }
});

// POST /apply handler removed - replaced by POST /apply/start (Phase A) and dashboard endpoints (Phase B)
// Old POST /apply was removed to implement 3-phase onboarding system
// New flow:
// - Phase A: POST /apply/start (creates user + draft profile)
// - Phase B: POST /dashboard/talent/onboarding/save (draft save)
//            POST /dashboard/talent/onboarding/submit (final submit)
// - Phase C: Background pipeline jobs (Scout, Maverick, Librarian, Comp Card)

// Legacy POST /apply route removed - no longer used
// POST /apply/start is now handled by routes/onboarding.js

module.exports = router;
