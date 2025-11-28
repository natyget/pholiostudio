/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.text('agency_boards').nullable(); // JSON string of board types
    table.text('agency_tags').nullable();   // JSON string of tags
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('agency_boards');
    table.dropColumn('agency_tags');
  });
};
