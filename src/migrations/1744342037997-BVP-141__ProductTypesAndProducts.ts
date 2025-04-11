import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP141_ProductTypesAndProducts1744342037997
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the product_type table
    await queryRunner.createTable(
      new Table({
        name: 'product_type',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'venueId',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add foreign key for venueId in product_type
    await queryRunner.createForeignKey(
      'product_type',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'venue',
        onDelete: 'CASCADE',
      }),
    );

    // Create the product table
    await queryRunner.createTable(
      new Table({
        name: 'product',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'productTypeId',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add foreign key for typeId in product
    await queryRunner.createForeignKey(
      'product',
      new TableForeignKey({
        columnNames: ['productTypeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_type',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key for productTypeId in product
    const productTable = await queryRunner.getTable('product');
    const productForeignKey = productTable!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('productTypeId') !== -1,
    );
    if (productForeignKey) {
      await queryRunner.dropForeignKey('product', productForeignKey);
    }

    // Drop the product table
    await queryRunner.dropTable('product');

    // Drop foreign key for venueId in product_type
    const productTypeTable = await queryRunner.getTable('product_type');
    const productTypeForeignKey = productTypeTable!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('venueId') !== -1,
    );
    if (productTypeForeignKey) {
      await queryRunner.dropForeignKey('product_type', productTypeForeignKey);
    }

    // Drop the product_type table
    await queryRunner.dropTable('product_type');
  }
}
