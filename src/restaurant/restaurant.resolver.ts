import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthorizeRole, AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/users/entities/users.entity';
import {
  CategoriesOutput,
  CategoryInputType,
  CategoryOutput,
  CreateCategoryInput,
  CreateCategoryOutput,
} from './args/categories.args';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './args/deleteRestaurant.args';
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishInput,
  DeleteDishOutput,
  DishOneInput,
  DishOutput,
  EditDishInput,
  EditDishOutput,
} from './args/dishes.args';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './args/editRestaurant.args';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
  RestaurantInputType,
  RestaurantOutput,
  RestaurantsInput,
  RestaurantsOutput,
} from './args/restaurant.args';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './args/searchRestaurants.args';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  //init
  constructor(private readonly restaurantService: RestaurantService) {}

  // create Restaurant
  @Mutation(() => CreateRestaurantOutput)
  @AuthorizeRole(['Owner'])
  async createRestaurant(
    @AuthUser() user: User,
    @Args('data') args: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createResuran(user, args);
  }

  // edit Restaurant
  @Mutation(() => EditRestaurantOutput)
  @AuthorizeRole(['Owner'])
  async editRestaurant(
    @AuthUser() user: User,
    @Args('data') args: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return await this.restaurantService.editRestaurant(user, args);
  }

  // delete Restaurant
  @Mutation(() => DeleteRestaurantOutput)
  @AuthorizeRole(['Owner'])
  async deleteRestaurant(
    @AuthUser() user: User,
    @Args('data') args: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return await this.restaurantService.deleteRestaurant(user, args);
  }

  // get all restaurants
  @Query(() => RestaurantsOutput)
  async getRestaurants(
    @Args('data') args: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return await this.restaurantService.getRestaurants(args);
  }
  // get all owner restaurants
  @Query(() => RestaurantsOutput)
  @AuthorizeRole(['Owner'])
  async getOwnerRestaurants(
    @AuthUser() owner: User,
    @Args('data') args: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return await this.restaurantService.getOwnerRestaurants(owner, args);
  }
  // get owner restaurant
  @Query(() => RestaurantOutput)
  @AuthorizeRole(['Owner'])
  async getOwnerRestaurant(
    @Args('data') args: RestaurantInputType,
  ): Promise<RestaurantOutput> {
    return await this.restaurantService.getOwnerRestaurant(args);
  }

  // get restaurant by id
  @Query(() => RestaurantOutput)
  async getRestaurant(
    @Args('data') args: RestaurantInputType,
  ): Promise<RestaurantOutput> {
    return await this.restaurantService.getRestaurant(args);
  }

  // search restaurant by query
  @Query(() => SearchRestaurantOutput)
  async searchRestaurants(
    @Args('data') args: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return await this.restaurantService.searchRestaurants(args);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @ResolveField(() => Int)
  async restaurantCount(@Parent() category: Category): Promise<number> {
    return await this.restaurantService.restaurantCount(category);
  }
  @Query(() => CategoriesOutput)
  async getCategories(): Promise<CategoriesOutput> {
    return await this.restaurantService.getCategories();
  }
  @Query(() => CategoryOutput)
  async getCategory(
    @Args('data') args: CategoryInputType,
  ): Promise<CategoryOutput> {
    return await this.restaurantService.getCategory(args);
  }

  @Mutation(() => CreateCategoryOutput)
  @AuthorizeRole(['Owner'])
  async createCategory(
    @AuthUser() user: User,
    @Args('data') args: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    return await this.restaurantService.createCategory(user, args);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  // create dish
  @Mutation(() => CreateDishOutput)
  @AuthorizeRole(['Owner'])
  async createDishe(
    @AuthUser() owner: User,
    @Args('data') args: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return await this.restaurantService.createDish(owner, args);
  }

  // delete dish
  @Mutation(() => DeleteDishOutput)
  @AuthorizeRole(['Owner'])
  async deleteDish(
    @AuthUser() owner: User,
    @Args() args: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return await this.restaurantService.deleteDish(owner, args);
  }

  // edit dish
  @Mutation(() => EditDishOutput)
  @AuthorizeRole(['Owner'])
  async editDish(
    @AuthUser() owner: User,
    @Args('data') args: EditDishInput,
  ): Promise<EditDishOutput> {
    return await this.restaurantService.editDish(owner, args);
  }

  // get dish by id
  @Query(() => DishOutput)
  async getDish(@Args() args: DishOneInput): Promise<DishOutput> {
    return await this.restaurantService.getDish(args);
  }
}
