const express = require('express');
const { requireRole } = require('./src/middleware/auth');
const knex = require('./src/db/knex');

// We simply need to require the router and mock the request/response

async function testProfileApi() {
  const profileRouter = require('./src/routes/talent/profile.api');
  
  // Find latest profile
  const profiles = await knex('profiles').orderBy('created_at', 'desc').limit(1);
  if (!profiles.length) {
    console.log("No profiles found.");
    process.exit(0);
  }
  const profile = profiles[0];
  console.log("Found profile for user:", profile.user_id);
  
  // Mock Request
  const req = {
    method: 'GET',
    url: '/profile',
    session: {
      userId: profile.user_id,
      role: 'TALENT' // Important for requireRole
    },
    get: (header) => header === 'accept' ? 'application/json' : '',
    protocol: 'http',
  };
  
  // Mock app to satisfy req.app and req.get('host')
  req.app = {
    get: (key) => null
  };
  req.get = (key) => key === 'host' ? 'localhost:3000' : '';
  
  const res = {
    status: (code) => {
      console.log('Status set to:', code);
      return res;
    },
    json: (data) => {
      console.log('Response JSON:', JSON.stringify(data, null, 2));
      process.exit(0);
    },
    send: (data) => {
      console.log('Response Send:', data);
      process.exit(0);
    }
  };
  
  const next = (err) => {
    if (err) {
      console.log('Next called with error:', err);
    } else {
      console.log('Next called without error. Route not matched!');
    }
    process.exit(1);
  };
  
  // Execute the router directly bypassing express
  console.log("Executing profile API...");
  try {
    profileRouter(req, res, next);
  } catch (err) {
    console.log("Caught exception:", err);
    process.exit(1);
  }
}

testProfileApi();
