import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { OrganizationSize } from '../utils/constants/organization.constants';

export class BVP63AccountOnboarding1746504336129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'onboarding_complete',
        type: 'boolean',
        isNullable: false,
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'organization_id',
        type: 'int',
        isNullable: true, // Allow null initially if not all users have an organization
      }),
    );

    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.addColumns('organization', [
      new TableColumn({
        name: 'address_line1',
        type: 'text',
        isNullable: false,
      }),
      new TableColumn({
        name: 'address_line2',
        type: 'text',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'city',
        type: 'varchar',
        length: '50',
        isNullable: false,
      }),
      new TableColumn({
        name: 'state',
        type: 'varchar',
        length: '50',
        isNullable: false,
      }),
      new TableColumn({
        name: 'zip',
        type: 'varchar',
        length: '10',
        isNullable: false,
      }),
      new TableColumn({
        name: 'size',
        type: 'enum',
        enum: Object.values(OrganizationSize),
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the foreign key
    await queryRunner.dropForeignKey('user', 'FK_users_organization_id');

    // Drop the organization_id column
    await queryRunner.dropColumn('user', 'organization_id');

    // Drop the onboarding_complete column
    await queryRunner.dropColumn('user', 'onboarding_complete');
  }
}
