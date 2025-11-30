/**
 * @param {import('knex')} knex
 */
exports.up = async function up(knex) {
  await knex.schema.table('users', (table) => {
    table.string('agency_instagram_handle', 100).nullable();
    table.text('agency_markets').nullable(); // JSON string of markets
    table.text('verification_document_path').nullable();
    table.string('verification_linkedin_url').nullable();
    table.boolean('is_verified').defaultTo(false);
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function down(knex) {
  await knex.schema.table('users', (table) => {
    table.dropColumn('agency_instagram_handle');
    table.dropColumn('agency_markets');
    table.dropColumn('verification_document_path');
    table.dropColumn('verification_linkedin_url');
    table.dropColumn('is_verified');
  });
};

