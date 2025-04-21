import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP35_AddEmailVerifyColumnToUser1744769229590
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'email_verified',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'email_verified');
  }
}
