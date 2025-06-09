import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class BVP218_UpdatingEmployeeTable1748938450190
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('employee', [
      new TableColumn({
        name: 'document',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'employee_invite_id',
        type: 'uuid',
        isNullable: false,
      }),
    ]);

    await queryRunner.createForeignKey(
      'employee',
      new TableForeignKey({
        columnNames: ['employee_invite_id'],
        referencedTableName: 'employee_invitation',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('employee');
    if (table) {
      const fk = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('employee_invite_id'),
      );
      if (fk) {
        await queryRunner.dropForeignKey('employee', fk);
      }
    }

    await queryRunner.dropColumns('employee', [
      'document',
      'employee_invite_id',
    ]);
  }
}
