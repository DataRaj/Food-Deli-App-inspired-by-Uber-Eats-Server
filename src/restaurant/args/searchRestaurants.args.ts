import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { PaginationInput, PaginationOutput } from 'src/common/pagination.args';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(() => String, { nullable: true })
  query?: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
  @Field(() => Int, { nullable: true })
  totalRestaurants?: number;
}
