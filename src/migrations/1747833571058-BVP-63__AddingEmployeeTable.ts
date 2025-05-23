import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class BVP63_AddingEmployeeTable1747833571058
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employee',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'address_line1',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'address_line2',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'zip',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'pin',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'employee_verified',
            type: 'boolean',
            default: false,
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
          {
            name: 'venueId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'employee',
      new TableForeignKey({
        columnNames: ['venueId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'venue',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('employee');
  }
}
