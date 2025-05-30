import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP63_CreateDeviceTable1747833420406
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'device',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: false,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'venueId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'device',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'venue',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('device');
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('venueId'),
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('device', foreignKey);
      }
    }

    await queryRunner.dropTable('device');
  }
}
