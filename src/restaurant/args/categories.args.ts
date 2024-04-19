import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreArgs } from 'src/common/core.args';
import { PaginationInput, PaginationOutput } from 'src/common/pagination.args';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class CategoriesOutput extends CoreArgs {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}

@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

@InputType()
export class CategoryInputType extends PaginationInput {
  @Field(() => String)
  slug: string;
}

//create
@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'iconImg',
]) {
  @Field(() => String, { nullable: true })
  slug?: string;
}

@ObjectType()
export class CreateCategoryOutput extends CoreArgs {}
