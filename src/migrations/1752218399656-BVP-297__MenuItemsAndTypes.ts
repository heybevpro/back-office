import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP297_MenuItemsAndTypes1752218399656
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'menu_item',
      new TableColumn({
        name: 'productTypeId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'menu_item',
      new TableForeignKey({
        columnNames: ['productTypeId'],
        referencedTableName: 'product_type',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const menuItemForeignKey = await queryRunner
      .getTable('menu_item')
      .then((table) =>
        table?.foreignKeys.find((fk) =>
          fk.columnNames.includes('productTypeId'),
        ),
      );
    if (menuItemForeignKey) {
      await queryRunner.dropForeignKey('menu_item', menuItemForeignKey);
    }
    await queryRunner.dropColumn('menu_item', 'productTypeId');
  }
}
