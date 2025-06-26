import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP247_AddingServingSizeTable1750759453768
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'serving_size',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'volume_in_ml',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'organizationId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'product_type_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'serving_size',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'serving_size',
      new TableForeignKey({
        columnNames: ['product_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_type',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const servingSizeTable = await queryRunner.getTable('serving_size');
    if (servingSizeTable) {
      const orgForeignKey = servingSizeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('organizationId') !== -1,
      );
      const productTypeForeignKey = servingSizeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('product_type_id') !== -1,
      );
      if (productTypeForeignKey) {
        await queryRunner.dropForeignKey('serving_size', productTypeForeignKey);
      }
      if (orgForeignKey) {
        await queryRunner.dropForeignKey('serving_size', orgForeignKey);
      }
    }

    await queryRunner.dropTable('serving_size');
  }
}
