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
            name: 'venueId',
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
        name: 'menu_item_ingredient',
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
        columnNames: ['venueId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'venue',
        onDelete: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['menu_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menu_item',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['custom_serving_size_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'serving_size',
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const menuItemProductTable = await queryRunner.getTable(
      'menu_item_ingredient',
    );
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
          'menu_item_ingredient',
          customServingSizeForeignKey,
        );
      }

      if (productForeignKey) {
        await queryRunner.dropForeignKey(
          'menu_item_ingredient',
          productForeignKey,
        );
      }

      if (menuItemForeignKey) {
        await queryRunner.dropForeignKey(
          'menu_item_ingredient',
          menuItemForeignKey,
        );
      }
    }

    const menuItemTable = await queryRunner.getTable('menu_item');
    if (menuItemTable) {
      const venueForeignKey = menuItemTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('venueId') !== -1,
      );
      if (venueForeignKey) {
        await queryRunner.dropForeignKey('menu_item', venueForeignKey);
      }
    }

    await queryRunner.dropTable('menu_item_ingredient');
    await queryRunner.dropTable('menu_item');
  }
}
