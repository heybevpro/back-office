import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP247_AddServingSizeToProductType1751617457149
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_type',
      new TableColumn({
        name: 'serving_size_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'product_type',
      new TableForeignKey({
        columnNames: ['serving_size_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'serving_size',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product_type');
    const foreignKey = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('serving_size_id'),
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('product_type', foreignKey);
    }
    await queryRunner.dropColumn('product_type', 'serving_size_id');
  }
}
