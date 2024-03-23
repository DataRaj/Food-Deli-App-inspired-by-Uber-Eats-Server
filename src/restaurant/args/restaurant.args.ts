import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreArgs } from 'src/common/core.args';
import { PaginationInput, PaginationOutput } from 'src/common/pagination.args';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(() => Number)
  categoryId: number;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreArgs {}

@InputType()
export class RestaurantsInput extends PaginationInput {
  @Field(() => String, { nullable: true })
  slug?: string;
}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(() => Int, { nullable: true })
  totalRestaurants?: number;
}
@InputType()
export class RestaurantInputType {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends CoreArgs {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
