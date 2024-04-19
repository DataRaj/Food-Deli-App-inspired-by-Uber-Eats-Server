import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/orders.entity';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { RestaurantResolver } from 'src/restaurant/restaurant.resolver';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { CategoryRepository } from 'src/restaurant/repo/category.repo';
import { Dish } from 'src/restaurant/entities/dish.entity';
import { User } from 'src/users/entities/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Restaurant,
      Dish,
      CategoryRepository,
      User,
    ]),
  ],
  providers: [
    OrdersService,
    RestaurantService,
    OrdersResolver,
    RestaurantResolver,
  ],
})
export class OrdersModule {}
