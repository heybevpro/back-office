import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BVP35_EmailInvitations1744718934005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_verification_code',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'verification_code',
            type: 'varchar',
            length: '6',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamptz',
            default: `now() + interval '5 hours'`,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('verification_code');
  }
}
