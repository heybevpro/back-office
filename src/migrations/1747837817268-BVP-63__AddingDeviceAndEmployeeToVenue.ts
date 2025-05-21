import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP63_AddingDeviceAndEmployeeToVenue1747837817268
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'venue',
      new TableColumn({
        name: 'employeeId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'venue',
      new TableColumn({
        name: 'deviceId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'venue',
      new TableForeignKey({
        columnNames: ['employeeId'],
        referencedTableName: 'employee',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'venue',
      new TableForeignKey({
        columnNames: ['deviceId'],
        referencedTableName: 'device',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('venue');

    if (!table) {
      throw new Error('Table "venue" does not exist');
    }

    const employeeFK = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('employeeId'),
    );
    const deviceFK = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('deviceId'),
    );

    if (employeeFK) {
      await queryRunner.dropForeignKey('venue', employeeFK);
    }

    if (deviceFK) {
      await queryRunner.dropForeignKey('venue', deviceFK);
    }

    await queryRunner.dropColumn('venue', 'employeeId');
    await queryRunner.dropColumn('venue', 'deviceId');
  }
}
