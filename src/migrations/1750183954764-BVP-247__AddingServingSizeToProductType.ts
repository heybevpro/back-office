import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP247_AddingServingSizeToProductType1750183954764
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_type',
      new TableColumn({
        name: 'servingSizeId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'product_type',
      new TableForeignKey({
        columnNames: ['servingSizeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'serving_size',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const productTypeTable = await queryRunner.getTable('product_type');
    if (productTypeTable) {
      const foreignKey = productTypeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('servingSizeId') !== -1,
      );

      if (foreignKey) {
        await queryRunner.dropForeignKey('product_type', foreignKey);
      }
    }

    await queryRunner.dropColumn('product_type', 'servingSizeId');
  }
}
