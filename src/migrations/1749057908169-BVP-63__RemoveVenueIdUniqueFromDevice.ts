import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP63_RemoveVenueIdUniqueFromDevice1749057908169
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('device', 'venueId');

    await queryRunner.addColumn(
      'device',
      new TableColumn({
        name: 'venueId',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('device', 'venueId');

    await queryRunner.addColumn(
      'device',
      new TableColumn({
        name: 'venueId',
        type: 'int',
        isNullable: true,
        isUnique: true,
      }),
    );
  }
}
