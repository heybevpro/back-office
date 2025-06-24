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

    await queryRunner.createTable(
      new Table({
        name: 'product_type_serving_sizes_serving_size',
        columns: [
          {
            name: 'servingSizeId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'productTypeId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'product_type_serving_sizes_serving_size',
      new TableForeignKey({
        columnNames: ['servingSizeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'serving_size',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_type_serving_sizes_serving_size',
      new TableForeignKey({
        columnNames: ['productTypeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_type',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_type_serving_sizes_serving_size');
    await queryRunner.dropTable('serving_size');
  }
}
