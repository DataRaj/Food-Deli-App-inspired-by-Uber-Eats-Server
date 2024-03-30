import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthorizeRole, AuthUser } from 'src/auth/auth.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  NEW_UPDATE_ORDER,
} from 'src/common/core.constants';
import { User } from 'src/users/entities/users.entity';
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
import { Order } from './entities/orders.entity';
import { OrdersService } from './orders.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject('PUB_SUB') private readonly pubsub: PubSub,
  ) {}

  // create order
  @Mutation(() => CreateOrderOutput)
  @AuthorizeRole(['Client', 'Owner'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('data') args: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return await this.ordersService.createOrder(customer, args);
  }

  // edit order
  @Mutation(() => EditOrderOutput)
  @AuthorizeRole(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('data') args: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return await this.ordersService.editOrder(user, args);
  }

  // get all orders
  @Query(() => OrdersOutput)
  @AuthorizeRole(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('data') args: OrdersInputFilter,
  ): Promise<OrderOutput> {
    return await this.ordersService.getOrders(user, args);
  }

  // get order by id
  @Query(() => OrderOutput)
  @AuthorizeRole(['Client', 'Owner'])
  async getOrderById(
    @AuthUser() user: User,
    @Args('data') args: OrderInputType,
  ): Promise<OrderOutput> {
    return await this.ordersService.getOrderById(user, args);
  }

  // take order

  @Mutation(() => OrderOutput)
  @AuthorizeRole(['Delivery'])
  async takeOrder(
    @AuthUser() driver: User,
    @Args('data') args: OrderInputType,
  ): Promise<OrderOutput> {
    return await this.ordersService.takeOrder(driver, args);
  }

  // --------------------SUBSCRIPTION----------------------

  // create order subscription
  @Subscription(() => Order, {
    filter: ({ pendingOrders }, _, { user }) =>
      pendingOrders?.ownerId === user?.id,
    resolve: ({ pendingOrders }) => pendingOrders.order,
  })
  @AuthorizeRole(['Owner'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  // edit order subscription
  @Subscription(() => Order)
  @AuthorizeRole(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  // update order
  @Subscription(() => Order)
  // @AuthorizeRole(['Any'])
  updateOrders() {
    return this.pubsub.asyncIterator(NEW_UPDATE_ORDER);
  }
}
