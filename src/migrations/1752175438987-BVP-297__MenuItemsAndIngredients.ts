import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP297_MenuItemsAndIngredients1752175438987
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
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'text',
            isNullable: true,
            default: null,
          },
          {
            name: 'venueId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedTableName: 'venue',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'menu_item_ingredient',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'productId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'servingSizeId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'menuItemId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedTableName: 'product',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['servingSizeId'],
        referencedTableName: 'serving_size',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item_ingredient',
      new TableForeignKey({
        columnNames: ['menuItemId'],
        referencedTableName: 'menu_item',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ingredientTable = await queryRunner.getTable('menu_item_ingredient');
    if (ingredientTable) {
      const productForeignKey = ingredientTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('productId'),
      );
      if (productForeignKey) {
        await queryRunner.dropForeignKey('menu_item', productForeignKey);
      }

      const servingSizeForeignKey = ingredientTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('servingSizeId'),
      );
      if (servingSizeForeignKey) {
        await queryRunner.dropForeignKey('menu_item', servingSizeForeignKey);
      }

      const menuItemForeignKey = ingredientTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('menuItemId'),
      );
      if (menuItemForeignKey) {
        await queryRunner.dropForeignKey('menu_item', menuItemForeignKey);
      }
    }

    await queryRunner.dropForeignKey(
      'menu_item_ingredient',
      'FK_menu_item_ingredient_productId',
    );
    await queryRunner.dropForeignKey(
      'menu_item_ingredient',
      'FK_menu_item_ingredient_servingSizeId',
    );
    await queryRunner.dropForeignKey(
      'menu_item_ingredient',
      'FK_menu_item_ingredient_menuItemId',
    );

    await queryRunner.dropTable('menu_item_ingredient');

    const menuItemTable = await queryRunner.getTable('menu_item');
    if (menuItemTable) {
      const venueForeignKey = menuItemTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('venueId'),
      );

      if (venueForeignKey) {
        await queryRunner.dropForeignKey('menu_item', venueForeignKey);
      }
    }
    await queryRunner.dropTable('menu_item');
  }
}
