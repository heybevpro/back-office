import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP224_UpdatingEmployeeInvitationTableDocumentColumnName1749492646601
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE employee_invitation
      SET "userMetadata" = 
        CASE 
          WHEN "userMetadata" IS NULL AND "documentUrl" IS NOT NULL 
            THEN jsonb_build_object('documentUrl', "documentUrl")
          WHEN "userMetadata" IS NOT NULL AND "documentUrl" IS NOT NULL 
            THEN "userMetadata" || jsonb_build_object('documentUrl', "documentUrl")
          ELSE "userMetadata"
        END
      WHERE "documentUrl" IS NOT NULL
    `);

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

    await queryRunner.query(`
      UPDATE employee_invitation
      SET "documentUrl" = ("userMetadata"->>'documentUrl')::varchar
      WHERE "userMetadata"->>'documentUrl' IS NOT NULL
    `);

    await queryRunner.query(`
      UPDATE employee_invitation
      SET "userMetadata" = "userMetadata" - 'documentUrl'
      WHERE "userMetadata"->>'documentUrl' IS NOT NULL
    `);
  }
}
