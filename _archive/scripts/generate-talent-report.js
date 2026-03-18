const knex = require('./src/db/knex');

async function generateReport() {
  try {
    console.log('--- Talent Profiles Report ---');
    
    // Total count
    const totalCount = await knex('profiles').count('* as count').first();
    console.log(`Total Profiles: ${totalCount.count}`);

    // Helper to get distribution
    async function getDist(column) {
      try {
        const dist = await knex('profiles')
          .select(column)
          .count('* as count')
          .groupBy(column);
        console.log(`\n${column.charAt(0).toUpperCase() + column.slice(1)} Distribution:`);
        dist.forEach(item => console.log(`- ${item[column] || 'Unknown/Not set'}: ${item.count}`));
      } catch (e) {
        console.log(`\n${column} distribution not available: ${e.message}`);
      }
    }

    await getDist('gender');
    await getDist('onboarding_stage');
    await getDist('experience_level');
    await getDist('ethnicity');

    // Seeking Representation
    try {
      const repInfo = await knex('profiles')
        .select('seeking_representation')
        .count('* as count')
        .groupBy('seeking_representation');
      console.log('\nSeeking Representation:');
      repInfo.forEach(r => console.log(`- ${r.seeking_representation ? 'Yes' : 'No'}: ${r.count}`));
    } catch (e) {
      console.log('\nSeeking representation info not available');
    }

    // Sample of recent profiles
    const recentProfiles = await knex('profiles')
        .select('*')
      .orderBy('created_at', 'desc')
      .limit(5);
    
    console.log('\n5 Most Recent Profiles:');
    recentProfiles.forEach(p => {
      console.log(`- ${p.first_name || 'No'} ${p.last_name || 'Name'} (${p.email || 'No email'})`);
      console.log(`  Stage: ${p.onboarding_stage || 'N/A'}, Created: ${p.created_at}`);
      console.log(`  Location: ${p.city || 'N/A'}, ${p.country || 'N/A'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error generating report:', error.message);
    process.exit(1);
  }
}


generateReport();
