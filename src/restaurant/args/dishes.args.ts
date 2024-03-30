import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreArgs } from 'src/common/core.args';
import { PaginationInput, PaginationOutput } from 'src/common/pagination.args';
import { Dish } from '../entities/dish.entity';

//create
@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
  'photo',
]) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreArgs {}

// get dishes
@ObjectType()
export class DishesOutput extends CoreArgs {
  @Field(() => [Dish], { nullable: true })
  dishes?: Dish[];
}
// get dish
@ObjectType()
export class DishOutput extends PaginationOutput {
  @Field(() => Dish, { nullable: true })
  dish?: Dish;
}

@InputType()
export class DishInputType extends PaginationInput {
  @Field(() => String)
  name: string;
}

// delete dish
@ArgsType()
export class DeleteDishInput {
  @Field()
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CoreArgs {}

// edit dish
@InputType()
export class EditDishInput extends PartialType(CreateDishInput) {
  @Field()
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreArgs {}

// dish
@ArgsType()
export class DishOneInput {
  @Field(() => Int)
  dishId: number;
}
