import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { AddressItem, User } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

export enum OrderStatus {
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  Failed = 'Failed',
}
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
export class OrderItem {
  @Field(() => String)
  id: string;
  @Field(() => Number)
  quantity: number;
  @Field(() => String)
  photo: string;
  @Field(() => String)
  name: string;
  @Field(() => Number)
  price: number;
  @Field(() => Number)
  restaurantId: number;
}

@InputType('OrderOptionItemInputType', { isAbstract: true })
@ObjectType()
export class OrderOptionItem {
  @Field(() => String)
  id: string;
  @Field(() => Number)
  quantity: number;
  @Field(() => String)
  name: string;
  @Field(() => Number)
  extra: number;
  @Field(() => Number)
  dishId: number;
}

@InputType('OrdersInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  customer?: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @Column('json')
  items: OrderItem[];

  @Field(() => [OrderOptionItem], { nullable: true })
  @Column('json', { nullable: true })
  options?: OrderOptionItem[];

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Cooking,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  @IsNumber()
  totalPrice?: number;

  @Column('json', { nullable: true })
  @Field(() => AddressItem, { nullable: true })
  address?: AddressItem;
}
