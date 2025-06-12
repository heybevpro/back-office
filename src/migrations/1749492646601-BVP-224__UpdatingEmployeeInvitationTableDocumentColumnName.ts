import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP224_UpdatingEmployeeInvitationTableDocumentColumnName1749492646601
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('employee_invitation', 'documentUrl');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'employee_invitation',
      new TableColumn({
        name: 'documentUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }
}
