import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

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
        onDelete: 'SET NULL', // Set to NULL if the organization is deleted
      }),
    );
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
