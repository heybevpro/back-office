import { ProductServingSize } from 'src/utils/constants/product.constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BVP247_AddingServingSizeToProductType1750183954764
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_type',
      new TableColumn({
        name: 'serving_size',
        type: 'enum',
        enum: Object.values(ProductServingSize),
        default: `'pour'`,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('product_type', 'serving_size');
  }
}
