import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('DishOptionInput', { isAbstract: false })
@ObjectType()
export class DishOption {
  @Field(() => String)
  id: string;
  @Field(() => String)
  name: string;
  @Field(() => Int)
  extra: number;
  @Field(() => Int)
  quantity: number;
}

@InputType('DishInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  description?: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOption], { nullable: true })
  @Column('json', { nullable: true })
  options?: DishOption[];
}
