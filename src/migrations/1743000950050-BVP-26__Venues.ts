import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class BVP26_Venues1743000950050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'venue',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '32',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '16',
            isNullable: false,
          },
          {
            name: 'capacity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'organizationId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'employeeId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'deviceId',
            type: 'uuid',
            isNullable: true,
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
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'venue',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organization',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'venue',
      new TableUnique({
        name: 'UQ_venue_organizationId_name',
        columnNames: ['organizationId', 'name'],
      }),
    );

    await queryRunner.createForeignKey(
      'venue',
      new TableForeignKey({
        columnNames: ['employeeId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employee',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'venue',
      new TableForeignKey({
        columnNames: ['deviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'device',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint(
      'venue',
      'UQ_venue_organizationId_name',
    );

    const table = await queryRunner.getTable('venue');
    if (table) {
      const orgFK = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('organizationId'),
      );
      const empFK = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('employeeId'),
      );
      const devFK = table.foreignKeys.find((fk) =>
        fk.columnNames.includes('deviceId'),
      );
      if (orgFK) await queryRunner.dropForeignKey('venue', orgFK);
      if (empFK) await queryRunner.dropForeignKey('venue', empFK);
      if (devFK) await queryRunner.dropForeignKey('venue', devFK);
    }
    await queryRunner.dropTable('venue');
  }
}
