import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP295_MoveInventory1751856628863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 12,
            scale: 3,
            default: 0,
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'inventoryId',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'product',
      new TableForeignKey({
        columnNames: ['inventoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'inventory',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.addColumn(
      'product',
      new TableColumn({
        name: 'venueId',
        type: 'int',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'product',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'venue',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('product');
    if (table) {
      const venueForeignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('venueId'),
      );

      if (venueForeignKey) {
        await queryRunner.dropForeignKey('product', venueForeignKey);
      }

      const inventoryForeignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('inventoryId'),
      );
      if (inventoryForeignKey) {
        await queryRunner.dropForeignKey('product', inventoryForeignKey);
      }
      await queryRunner.dropColumn('product', 'venueId');
      await queryRunner.dropColumn('product', 'inventoryId');
    }

    await queryRunner.dropTable('inventory');
  }
}
