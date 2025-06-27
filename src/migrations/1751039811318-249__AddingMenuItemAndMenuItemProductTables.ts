import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class AddingMenuItemAndMenuItemProductTables1751039811318
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'menu_item',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
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

    await queryRunner.createTable(
      new Table({
        name: 'menu_item_product',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'menu_item_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'custom_serving_size_id',
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
      'menu_item',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_product',
      new TableForeignKey({
        columnNames: ['menu_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menu_item',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_product',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_product',
      new TableForeignKey({
        columnNames: ['custom_serving_size_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'serving_size',
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const menuItemProductTable =
      await queryRunner.getTable('menu_item_product');
    if (menuItemProductTable) {
      const customServingSizeForeignKey = menuItemProductTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('custom_serving_size_id') !== -1,
      );
      const productForeignKey = menuItemProductTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('product_id') !== -1,
      );
      const menuItemForeignKey = menuItemProductTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('menu_item_id') !== -1,
      );

      if (customServingSizeForeignKey) {
        await queryRunner.dropForeignKey(
          'menu_item_product',
          customServingSizeForeignKey,
        );
      }

      if (productForeignKey) {
        await queryRunner.dropForeignKey(
          'menu_item_product',
          productForeignKey,
        );
      }

      if (menuItemForeignKey) {
        await queryRunner.dropForeignKey(
          'menu_item_product',
          menuItemForeignKey,
        );
      }
    }

    const menuItemTable = await queryRunner.getTable('menu_item');
    if (menuItemTable) {
      const organizationForeignKey = menuItemTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('organizationId') !== -1,
      );
      if (organizationForeignKey) {
        await queryRunner.dropForeignKey('menu_item', organizationForeignKey);
      }
    }

    await queryRunner.dropTable('menu_item_product');
    await queryRunner.dropTable('menu_item');
  }
}
