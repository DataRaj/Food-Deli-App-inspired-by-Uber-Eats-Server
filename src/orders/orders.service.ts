import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { v4 as uuid } from 'uuid';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  NEW_UPDATE_ORDER,
} from 'src/common/core.constants';
import { Dish } from 'src/restaurant/entities/dish.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import {
  CreateOrderInput,
  CreateOrderOutput,
  EditOrderInput,
  EditOrderOutput,
  OrderInputType,
  OrderOutput,
  OrdersInputFilter,
  OrdersOutput,
} from './args/orders.args';
import { Order, OrderStatus } from './entities/orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject('PUB_SUB') private readonly pubsub: PubSub,
  ) {}

  // ----------------------------------------------------------createOrder-----------------------------------------------
  // async createOrder(
  //   customer: User,
  //   {
  //     restaurantId,
  //     totalPrice,
  //     dishQuantity,
  //     dishOptionQuantity,
  //     userAddress,
  //   }: CreateOrderInput,
  // ): Promise<CreateOrderOutput> {
  //   try {
  //     const user = await this.users.findOne({ id: customer.id });
  //     if (!user) {
  //       throw new Error('User not found');
  //     }

  //     let newAddresses = [];
  //     if (user?.address) {
  //       if (user.address.find((item) => item.id === userAddress.id)) {
  //         newAddresses = [...user.address];
  //       } else {
  //         newAddresses = [...user.address, userAddress];
  //       }
  //     } else {
  //       newAddresses.push(userAddress);
  //     }

  //     const saveAddress = await this.users.update(
  //       { id: user.id },
  //       { address: newAddresses },
  //     );

  //     if (!saveAddress) {
  //       throw new Error('Address not saved');
  //     }

  //     // find restaurant
  //     const restaurant = await this.restaurant.findOne(restaurantId);
  //     if (!restaurant) {
  //       throw new Error('Restaurant not found');
  //     }

  //     const items = [];

  //     const options = [];
  //     for (const item of dishQuantity) {
  //       const dish = await this.dishes.findOne(item.id);

  //       if (!dish) {
  //         throw new Error('Dish not found');
  //       }

  //       if (dish?.options) {
  //         dishOptionQuantity?.map(async (dishOption) => {
  //           const dishOptionId = dishOption.id;

  //           const dishOptionFind = dish?.options?.find((option) => {
  //             return option.id === dishOptionId;
  //           });

  //           if (dishOptionFind) {
  //             const optionsItem = {
  //               ...dishOptionFind,
  //               quantity: dishOption.quantity,
  //               dishId: dish.id,
  //             };

  //             options.push(optionsItem);
  //           }
  //         });
  //       }

  //       const orderItem = {
  //         id: dish.id,
  //         name: dish.name,
  //         photo: dish.photo,
  //         price: dish.price,
  //         restaurantId,
  //         quantity: item.quantity,
  //       };

  //       items.push(orderItem);
  //     }

  //     const orderCreate = this.orders.create({
  //       customer,
  //       restaurant,
  //       totalPrice,
  //       items,
  //       options,
  //       address: userAddress,
  //     });

  //     const order = await this.orders.save(orderCreate);
  //     await this.pubsub.publish(NEW_PENDING_ORDER, {
  //       pendingOrders: { order, ownerId: restaurant.ownerId },
  //     });
  //     return {
  //       ok: true,
  //       message: 'Great ! Order Created successfully',
  //       orderId: order.id,
  //     };
  //   } catch (error) {
  //     return { ok: false, message: error.message };
  //   }
  // }
  async createOrder(
    customer: User,
    {
      restaurantId,
      totalPrice,
      dishQuantity,
      dishOptionQuantity,
      userAddress,
    }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const user = await this.users.findOne({where: { id: customer.id }});
      if (!user) {
        throw new Error('User not found');
      }

      const newAddresses = user.address ? [...user.address] : [];
      if (!newAddresses.find((item) => item.id === userAddress.id)) {
        newAddresses.push(userAddress);
      }

      await this.users.update({ id: user.id }, { address: newAddresses });

      const restaurant = await this.restaurant.findOne({where:{ id: restaurantId}});
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      const items = [];
      const options = [];

      for (const item of dishQuantity) {
        const dish = await this.dishes.findOne({ where: { id: item.id } });
        if (!dish) {
          throw new Error('Dish not found');
        }

        if (dish.options) {
          for (const dishOption of dishOptionQuantity) {
            const dishOptionFind = dish.options.find((option) => option.id === dishOption.id);
            if (dishOptionFind) {
              options.push({
                ...dishOptionFind,
                quantity: dishOption.quantity,
                dishId: dish.id,
              });
            }
          }
        }

        items.push({
          id: dish.id,
          name: dish.name,
          photo: dish.photo,
          price: dish.price,
          restaurantId,
          quantity: item.quantity,
        });
      }

      const order = this.orders.create({
        customer,
        restaurant,
        totalPrice,
        items,
        options,
        address: userAddress,
      });

      const savedOrder = await this.orders.save(order);
      await this.pubsub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order: savedOrder, ownerId: restaurant.ownerId },
      });

      return {
        ok: true,
        message: 'Great! Order created successfully',
        orderId: savedOrder.id,
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // ----------------------------------------------------------editOrder-----------------------------------------------
  // async editOrder(
  //   user: User,
  //   { id: orderId, status }: EditOrderInput,
  // ): Promise<EditOrderOutput> {
  //   try {
  //     const order = await this.orders.findOne(orderId, {
  //       loadEagerRelations: true,
  //     });
  //     if (!order) {
  //       throw new Error('Order not found');
  //     }
  //     if (!this.canSeeOrder(user, order)) {
  //       throw new Error('You are not authorized to view this order');
  //     }
  //     let canEdit = true;

  //     //client
  //     if (user.role === UserRole.Client) {
  //       canEdit = false;
  //       throw new Error('You are not authorized to edit this order');
  //     }
  //     //owner
  //     if (user.role === UserRole.Owner) {
  //       if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
  //         canEdit = false;
  //         throw new Error('You are not authorized to edit this order');
  //       }
  //     }
  //     //delivery
  //     if (user.role === UserRole.Delivery) {
  //       if (
  //         status !== OrderStatus.PickedUp &&
  //         status !== OrderStatus.Delivered
  //       ) {
  //         canEdit = false;
  //         throw new Error('You are not authorized to edit this order');
  //       }
  //     }
  //     if (!canEdit) {
  //       throw new Error('You are not authorized to seeeeee edit this order');
  //     }
  //     await this.orders.save({
  //       id: orderId,
  //       status,
  //     });
  //     if (user.role === UserRole.Owner) {
  //       if (status === OrderStatus.Cooked) {
  //         await this.pubsub.publish(NEW_COOKED_ORDER, {
  //           cookedOrders: { ...order, status },
  //         });
  //       }
  //     }

  //     await this.pubsub.publish(NEW_UPDATE_ORDER, {
  //       updateOrders: { ...order, status },
  //     });

  //     return { ok: true, message: 'Order Updated successfully' };
  //   } catch (error) {
  //     return { ok: false, message: error.message };
  //   }
  // }


  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders
        .createQueryBuilder('order')
        .where('order.id = :orderId', { orderId })
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.restaurant', 'restaurant')
        .leftJoinAndSelect('order.driver', 'driver')
        .getOne();

      if (!order) {
        throw new Error('Order not found');
      }

      if (!this.canSeeOrder(user, order)) {
        throw new Error('You are not authorized to view this order');
      }

      let canEdit = true;

      // Client
      if (user.role === UserRole.Client) {
        canEdit = false;
        throw new Error('You are not authorized to edit this order');
      }

      // Owner
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
          throw new Error('You are not authorized to edit this order');
        }
      }

      // Delivery
      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
          canEdit = false;
          throw new Error('You are not authorized to edit this order');
        }
      }

      if (!canEdit) {
        throw new Error('You are not authorized to edit this order');
      }

      // Update order status
      await this.orders.update(orderId, { status });

      // Publish events
      if (user.role === UserRole.Owner && status === OrderStatus.Cooked) {
        await this.pubsub.publish(NEW_COOKED_ORDER, { cookedOrders: { ...order, status } });
      }

      await this.pubsub.publish(NEW_UPDATE_ORDER, { updateOrders: { ...order, status } });

      return { ok: true, message: 'Order updated successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // async getOrderById(user: User, { id }: OrderInputType): Promise<OrderOutput> {
  //   try {
  //     const order = await this.orders.findOne(id, {
  //       relations: ['restaurant'],
  //     });
  //     if (!order) {
  //       throw new Error('Order not found');
  //     }
  //     if (!this.canSeeOrder(user, order)) {
  //       throw new Error('You are not authorized to view this order');
  //     }
  //     return { ok: true, message: 'Order Found successfully', order };
  //   } catch (error) {
  //     return { ok: false, message: error.message };
  //   }
  // }

  async getOrderById(user: User, { id }: OrderInputType): Promise<OrderOutput> {
    try {
      const order = await this.orders
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.restaurant', 'restaurant')
        .where('order.id = :id', { id })
        .getOne();

      if (!order) {
        throw new Error('Order not found');
      }

      if (!this.canSeeOrder(user, order)) {
        throw new Error('You are not authorized to view this order');
      }

      return { ok: true, message: 'Order found successfully', order };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getOrders(
    user: User,
    { status }: OrdersInputFilter,
  ): Promise<OrdersOutput> {
    try {
      let orders;
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user, ...(status && { status }) },
          order: { createdAt: 'DESC' },
        });
        return { ok: true, message: 'Orders Found successfully', orders };
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user, ...(status && { status }) },
        });
        return { ok: true, message: 'Orders Found successfully', orders };
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurant.find({
          relations: ['orders'],

          where: { owner: user },
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.filter((order: Order) => order.status === status);
        }

        return {
          ok: true,
          message: 'Orders Found successfully',
          orders,
        };
      }

      return { ok: true, message: 'Orders Found successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  // async takeOrder(driver: User, { id }: OrderInputType): Promise<OrderOutput> {
  //   try {
  //     const order = await this.orders.findOne(id, {
  //       relations: ['restaurant'],
  //     });
  //     if (!order) {
  //       throw new Error('Order not found');
  //     }
  //     await this.orders.save({
  //       id: order.id,
  //       driver,
  //     });
  //     await this.pubsub.publish(NEW_UPDATE_ORDER, {
  //       updateOrders: { ...order, driver },
  //     });
  //     return { ok: true, message: 'Order Updated successfully' };
  //   } catch (error) {
  //     return { ok: false, message: error.message };
  //   }
  // }


  async takeOrder(driver: User, { id }: OrderInputType): Promise<OrderOutput> {
    try {
      const order = await this.orders
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.restaurant', 'restaurant')
        .where('order.id = :id', { id })
        .getOne();

      if (!order) {
        throw new Error('Order not found');
      }

      // Update the order with the new driver
      order.driver = driver;
      await this.orders.save(order);

      // Publish the update event
      await this.pubsub.publish(NEW_UPDATE_ORDER, {
        updateOrders: { ...order, driver },
      });

      return { ok: true, message: 'Order updated successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    } else if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    } else if (
      user.role === UserRole.Owner &&
      order.restaurant.ownerId !== user.id
    ) {
      canSee = false;
    }
    return canSee;
  }
}
