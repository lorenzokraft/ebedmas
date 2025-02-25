import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // No need to drop tables here since they've already been dropped manually
  // This migration is just for documentation purposes
  console.log('Tables subscription_plans and subscriptions have been dropped manually');
}

export async function down(knex: Knex): Promise<void> {
  // Recreate tables if needed to rollback
  await knex.schema.createTable('subscription_plans', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.decimal('price', 10, 2).notNullable();
    table.integer('duration').notNullable();
    table.string('duration_unit').notNullable();
    table.text('features');
    table.boolean('is_active').defaultTo(true);
    table.string('package_type').defaultTo('all_access');
    table.text('subjects');
    table.decimal('yearly_discount_percentage', 5, 2).defaultTo(30.00);
    table.decimal('additional_child_discount_percentage', 5, 2).defaultTo(50.00);
    table.json('metadata');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('subscriptions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('plan_id').unsigned().notNullable();
    table.dateTime('start_date').notNullable();
    table.dateTime('end_date').notNullable();
    table.string('status').defaultTo('active');
    table.boolean('is_frozen').defaultTo(false);
    table.dateTime('frozen_until');
    table.boolean('auto_renew').defaultTo(true);
    table.timestamps(true, true);
    
    table.foreign('user_id').references('users.id');
    table.foreign('plan_id').references('subscription_plans.id');
  });
}
