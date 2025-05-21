import { MigrationInterface, QueryRunner, Table } from 'typeorm';

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
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'venueId',
            type: 'int',
            isNullable: true,
            isUnique: true,
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
