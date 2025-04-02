import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { InvitationStatus } from '../utils/constants/status.constants';

export class BVP35_InvitationsWorkflow1742881681440
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'invitation',
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
            name: 'status',
            type: 'enum',
            isNullable: false,
            enum: Object.values(InvitationStatus),
            default: `'PENDING'`,
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
    await queryRunner.dropTable('invitation');
  }
}
