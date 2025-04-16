import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP141_AddingTimestampsToProductsAndTypes1744379163212
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('product', [
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'NOW()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'NOW()',
      }),
    ]);

    await queryRunner.addColumns('product_type', [
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'NOW()',
      }),
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'NOW()',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('product', ['created_at', 'updated_at']);

    await queryRunner.dropColumns('product_type', ['created_at', 'updated_at']);
  }
}
