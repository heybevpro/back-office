import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP249_DecimalProductQuantity1751880029243
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product', 'quantity');
    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'quantity',
        type: 'decimal',
        precision: 10,
        scale: 3,
        default: 0,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product', 'quantity');
    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'quantity',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );
  }
}
