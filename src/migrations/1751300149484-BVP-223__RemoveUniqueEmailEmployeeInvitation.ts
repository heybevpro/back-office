import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP223_RemoveUniqueEmailEmployeeInvitation1751300149484
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('employee_invitation', 'email');

    await queryRunner.addColumn(
      'employee_invitation',
      new TableColumn({
        name: 'email',
        type: 'varchar',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('employee_invitation', 'email');

    await queryRunner.addColumn(
      'employee_invitation',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isUnique: true,
      }),
    );
  }
}
