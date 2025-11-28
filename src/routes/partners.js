const express = require('express');
const knex = require('../db/knex');
const router = express.Router();

router.get('/partners', async (req, res, next) => {
  try {
    // Fetch confirmed agencies
    const agencies = await knex('users')
      .where({ role: 'AGENCY' })
      .select(
        'id',
        'agency_name',
        'agency_logo_path',
        'agency_location',
        'agency_website',
        'agency_description',
        'agency_boards',
        'agency_tags'
      );

    // Parse JSON fields if they are strings (SQLite stores as text)
    const parsedAgencies = agencies.map(agency => {
      let boards = [];
      let tags = [];
      
      try {
        boards = agency.agency_boards ? JSON.parse(agency.agency_boards) : [];
      } catch (e) {
        // If parsing fails, maybe it's already an object or just a string
        boards = agency.agency_boards ? [agency.agency_boards] : [];
      }

      try {
        tags = agency.agency_tags ? JSON.parse(agency.agency_tags) : [];
      } catch (e) {
        tags = agency.agency_tags ? [agency.agency_tags] : [];
      }

      return {
        ...agency,
        boards,
        tags
      };
    });

    // Hardcoded "Coming Soon" agencies
    const comingSoonAgencies = [
      {
        name: 'Elite Paris',
        location: 'Paris, France',
        logo_path: '/images/logos/elite-placeholder.png', // Placeholder
        description: 'Top tier high fashion agency expanding to digital scouting.'
      },
      {
        name: 'Storm Management',
        location: 'London, UK',
        logo_path: '/images/logos/storm-placeholder.png', // Placeholder
        description: 'Legendary agency known for discovering icons.'
      },
      {
        name: 'IMG Models',
        location: 'New York / Global',
        logo_path: '/images/logos/img-placeholder.png', // Placeholder
        description: 'Global leader in talent discovery and management.'
      }
    ];

    res.render('partners/index', {
      title: 'Partners & Agencies — Pholio',
      layout: 'layout',
      currentPage: 'partners',
      agencies: parsedAgencies,
      comingSoonAgencies
    });
  } catch (error) {
    console.error('[Partners Route] Error:', error);
    next(error);
  }
});

module.exports = router;
