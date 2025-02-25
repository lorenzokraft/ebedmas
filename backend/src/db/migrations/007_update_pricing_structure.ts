import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePricingStructure1708104448123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update the pricing structure to use fixed discount for additional children
        const result = await queryRunner.query(
            `SELECT value FROM subscription_settings WHERE name = 'default_pricing'`
        );
        
        if (result && result[0]) {
            const pricing = JSON.parse(result[0].value);
            
            // Update each plan to use fixed additional child discount
            pricing.forEach((plan: any) => {
                // Remove the percentage-based discount
                delete plan.additionalChildDiscountPercentage;
                // Add fixed discount amount (£30 default)
                plan.additionalChildDiscountAmount = 3000;
            });
            
            await queryRunner.query(
                `UPDATE subscription_settings SET value = ? WHERE name = 'default_pricing'`,
                [JSON.stringify(pricing)]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const result = await queryRunner.query(
            `SELECT value FROM subscription_settings WHERE name = 'default_pricing'`
        );
        
        if (result && result[0]) {
            const pricing = JSON.parse(result[0].value);
            
            // Revert back to percentage-based discount
            pricing.forEach((plan: any) => {
                // Remove fixed discount amount
                delete plan.additionalChildDiscountAmount;
                // Add back percentage-based discount
                plan.additionalChildDiscountPercentage = 10;
            });
            
            await queryRunner.query(
                `UPDATE subscription_settings SET value = ? WHERE name = 'default_pricing'`,
                [JSON.stringify(pricing)]
            );
        }
    }
}
