import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP26_UpdatingVenues1743575916481 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('venue', [
      new TableColumn({
        name: 'address',
        type: 'text',
        isNullable: false,
      }),
      new TableColumn({
        name: 'capacity',
        type: 'int',
        isNullable: false,
      }),
      new TableColumn({
        name: 'city',
        type: 'varchar',
        length: '32',
        isNullable: false,
      }),
      new TableColumn({
        name: 'state',
        type: 'varchar',
        length: '16',
        isNullable: false,
      }),
      new TableColumn({
        name: 'phone_number',
        type: 'varchar',
        length: '20',
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('venue', [
      'address',
      'capacity',
      'city',
      'phone_number',
      'state',
    ]);
  }
}
