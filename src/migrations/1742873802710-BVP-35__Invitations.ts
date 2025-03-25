import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BVP35_Invitations1742873802710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'verification_code',
        columns: [
          {
            name: 'id',
            type: 'int',
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '15',
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
            default: new Date().setHours(new Date().getHours() + 6),
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
