import { Status } from 'src/utils/constants/employee.constants';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP218_AddingEmployeeInvitationTable1748938035733
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employee_invitation',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'pin',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            isNullable: false,
            enum: Object.values(Status),
            default: `'onboarding_pending'`,
          },
          {
            name: 'venueId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'userMetadata',
            type: 'jsonb',
            isNullable: true,
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
      'employee_invitation',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedTableName: 'venue',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('employee_invitation');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('venueId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('employee_invitation', foreignKey);
      }
    }
    await queryRunner.dropTable('employee_invitation');
  }
}
