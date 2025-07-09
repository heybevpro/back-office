import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP95_MoveInventory1751856628863 implements MigrationInterface {
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
            name: 'productId',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
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
    }

    const productTable = await queryRunner.getTable('product');
    if (productTable) {
      const venueForeignKey = productTable.foreignKeys.find((fk) =>
        fk.columnNames.includes('venueId'),
      );
      if (venueForeignKey) {
        await queryRunner.dropForeignKey('product', venueForeignKey);
      }
    }

    await queryRunner.dropTable('inventory');
  }
}
