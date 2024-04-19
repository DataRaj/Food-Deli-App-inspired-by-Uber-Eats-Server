import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreArgs } from 'src/common/core.args';
import { CreateRestaurantInput } from './restaurant.args';

@InputType()
export class DeleteRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field()
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreArgs {}
