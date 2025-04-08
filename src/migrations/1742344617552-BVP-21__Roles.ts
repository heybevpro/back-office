import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { Role } from '../utils/constants/role.constants';

export class BVP21_Roles1742344617552 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_name',
            type: 'enum',
            isUnique: true,
            enum: Object.values(Role),
            isNullable: false,
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

    await queryRunner.query(
      `INSERT INTO "role" ("role_name")
       VALUES ('${Role.SUPER_ADMIN}'),
              ('${Role.ADMIN}'),
              ('${Role.MANAGER}'),
              ('${Role.GUEST}');`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const defaultRole: Array<{ id: string }> = await queryRunner.query(
      `SELECT id
       FROM role
       WHERE role_name = '${Role.GUEST}'`,
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'roleId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE "user"
       SET "roleId" = '${defaultRole[0].id}'`,
    );

    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'role',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role');
    const table = await queryRunner.getTable('user');
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('roleId') !== -1,
    );
    await queryRunner.dropForeignKey('user', foreignKey!);
    await queryRunner.dropColumn('user', 'roleId');
  }
}
