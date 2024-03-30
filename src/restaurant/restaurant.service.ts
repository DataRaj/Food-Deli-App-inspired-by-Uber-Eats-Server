import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/users.entity';
import { Raw, Repository } from 'typeorm';
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
import { CategoryRepository } from './repo/category.repo';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createResuran(
    owner: User,
    args: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurant.create(args);
      newRestaurant.owner = owner;
      const category = await this.categories.findOne({where: { id: args.categoryId }});
      newRestaurant.category = category;
      await this.restaurant.save(newRestaurant);
      return { ok: true, message: 'Restaurants Created successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async editRestaurant(
    owner: User,
    args: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurant.findOne({where :{id :args.restaurantId}}); 
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      if (owner.id !== restaurant.ownerId) {
        throw new Error('You are not authorized to edit this restaurant');
      }
      let category: Category = null;
      if (args?.categoryId) {
        category = await this.categories.findOne({where: { id: args.categoryId }});
      }
      await this.restaurant.save([
        {
          id: args.restaurantId,
          ...args,
          ...(category && { category }),
        },
      ]);
      return { ok: true, message: 'Restaurants Updated successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async deleteRestaurant(
    owner: User,
    args: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurant.findOne({where: {id: args.restaurantId}});
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      if (owner.id !== restaurant.ownerId) {
        throw new Error('You are not authorized to delete this restaurant');
      }
      await this.restaurant.delete(args.restaurantId);
      return { ok: true, message: 'Restaurant Deleted successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getCategories(): Promise<CategoriesOutput> {
    try {
      const categories = await this.categories.find({
        order: { createdAt: 'DESC' },
      });
      if (!categories) {
        throw new Error('Categories not found');
      }

      return {
        ok: true,
        message: 'Categories Founded Successfully',
        categories,
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async restaurantCount(category: Category): Promise<number> {
    return this.restaurant.count({where:{ category }});
  }
  async getCategory({
    slug,
    page,
  }: CategoryInputType): Promise<CategoryOutput> {
    try {
      if (slug === 'all') {
        const restaurants = await this.restaurant.find({
          relations: ['category'],
          skip: (page - 1) * 9,
          take: 9,
          order: {
            isPromoted: 'DESC',
          },
        });
        return {
          ok: true,
          message: 'Restaurants Founded Successfully',
          restaurants,
        };
      }

      const category = await this.categories.findOne({where:{ slug }});
      if (!category) {
        throw new Error('category not found');
      }
      const restaurants = await this.restaurant.find({
        where: { category },
        relations: ['category'],
        skip: (page - 1) * 9,
        take: 9,
        order: {
          isPromoted: 'DESC',
        },
      });
      category.restaurants = restaurants;
      const total = await this.restaurantCount(category);
      return {
        ok: true,
        message: 'category Founded Successfully',
        category,
        restaurants,
        totalPages: Math.ceil(total / 9),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async getRestaurants({
    page,
    slug,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalRestaurants] =
        await this.restaurant.findAndCount({
          skip: (page - 1) * 9,
          take: 9,
          order: { isPromoted: 'DESC' },
          relations: ['category'],
          where: {
            ...(slug && slug !== 'all' && { category: { slug } }),
          },
        });
      if (restaurants.length === 0) {
        throw new Error('Restaurants not found');
      }
      return {
        ok: true,
        message: 'Restaurants Founded Successfully',
        restaurants,
        totalRestaurants,
        totalPages: Math.ceil(totalRestaurants / 9),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async getOwnerRestaurants(
    owner: User,
    { page }: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalRestaurants] =
        await this.restaurant.findAndCount({
          where: { owner },
          skip: (page - 1) * 9,
          take: 9,
          order: { isPromoted: 'DESC' },
          relations: ['category'],
        });

      if (restaurants.length === 0) {
        throw new Error('Restaurants not found');
      }
      return {
        ok: true,
        message: 'Restaurants Founded Successfully',
        restaurants,
        totalRestaurants,
        totalPages: Math.ceil(totalRestaurants / 9),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async getOwnerRestaurant({
    restaurantId,
  }: RestaurantInputType): Promise<RestaurantOutput> {
    try {
      // const restaurant = await this.restaurant.findOne(restaurantId, {
      //   relations: ['menu', 'orders', 'category', 'owner'],
      // });

      const restaurant = await this.restaurant.createQueryBuilder('restaurant')
    .leftJoinAndSelect('restaurant.menu', 'menu')
    .leftJoinAndSelect('restaurant.orders', 'orders')
    .leftJoinAndSelect('restaurant.category', 'category')
    .leftJoinAndSelect('restaurant.owner', 'owner')
    .where('restaurant.id = :restaurantId', { restaurantId })
    .getOne();

      return {
        ok: true,
        message: 'Restaurant Founded Successfully',
        restaurant,
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async getRestaurant({
    restaurantId,
  }: RestaurantInputType): Promise<RestaurantOutput> {
    try {
      // const restaurant = await this.restaurant.findOne(restaurantId, {
      //   relations: ['menu', 'category'],
      // });

      const restaurant = await this.restaurant.createQueryBuilder('restaurant')
    .leftJoinAndSelect('restaurant.menu', 'menu')
    .leftJoinAndSelect('restaurant.category', 'category')
    .where('restaurant.id = :restaurantId', { restaurantId })
    .getOne();


      return {
        ok: true,
        message: 'Restaurant Founded Successfully',
        restaurant,
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
  async searchRestaurants({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalRestaurants] =
        await this.restaurant.findAndCount({
          where: {
            name: Raw((alias) => `${alias} ILIKE '%${query}%'`),
          },
          skip: (page - 1) * 9,
          take: 9,
          relations: ['category'],
          order: { isPromoted: 'DESC' },
        });

      if (restaurants && restaurants.length > 0) {
        return {
          ok: true,
          message: 'Restaurants Founded Successfully',
          restaurants,
          totalRestaurants,
          totalPages: Math.ceil(totalRestaurants / 9),
        };
      }
      return {
        ok: false,
        message: 'No Restaurants Founded',
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async createCategory(
    user: User,
    args: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    try {
      if (UserRole.Owner !== user.role) {
        throw new Error('You are not authorized to create category');
      }
      const newCategory = await this.categories.getOrCreate(args);
      await this.categories.save(newCategory);
      return { ok: true, message: 'Category Created successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async createDish(
    owner: User,
    args: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // find restaurant
      const restaurant = await this.restaurant.findOne({where: {id : args.restaurantId}});
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      // check restaurant owner is same as user
      if (owner.id !== restaurant.ownerId) {
        throw new Error('You are not authorized to create this dish');
      }

      // create new dish
      const dish = this.dishes.create({ ...args, restaurant });
      if (!dish) {
        throw new Error('Dish not created,something went wrong');
      }

      await this.dishes.save(dish);
      // return result
      return { ok: true, message: 'Dish Created successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async deleteDish(
    owner: User,
    args: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      // const dish = await this.dishes.findOne(args.dishId, {
      //   relations: ['restaurant'],
      // });

      const dish = await this.dishes.createQueryBuilder('dish')
    .leftJoinAndSelect('dish.restaurant', 'restaurant')
    .where('dish.id = :dishId', { dishId: args.dishId })
    .getOne();

      if (!dish) {
        throw new Error('Dish not found');
      }
      if (owner.id !== dish.restaurant.ownerId) {
        throw new Error('You are not authorized to edit this dish');
      }
      await this.dishes.delete(args.dishId);
      return { ok: true, message: 'Dish Deleted successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async editDish(owner: User, args: EditDishInput): Promise<EditDishOutput> {
    try {
      // const dish = await this.dishes.findOne(args.dishId, {
      //   relations: ['restaurant'],
      // });

      const dish = await this.dishes.createQueryBuilder('dish')
    .leftJoinAndSelect('dish.restaurant', 'restaurant')
    .where('dish.id = :dishId', { dishId: args.dishId })
    .getOne();

      if (!dish) {
        throw new Error('Dish not found');
      }
      if (owner.id !== dish.restaurant.ownerId) {
        throw new Error('You are not authorized to edit this dish');
      }
      await this.dishes.save([
        {
          id: args.dishId,
          ...args,
        },
      ]);

      return { ok: true, message: 'Dish Updated successfully' };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getDish({ dishId }: DishOneInput): Promise<DishOutput> {
    try {
      // const dish = await this.dishes.findOne(dishId, {
        // relations: ['restaurant'],
      // });

      const dish = await this.dishes.createQueryBuilder('dish')
    .leftJoinAndSelect('dish.restaurant', 'restaurant')
    .where('dish.id = :dishId', { dishId })
    .getOne();

      if (!dish) {
        throw new Error('Dish not found');
      }
      return {
        ok: true,
        message: 'Dish Founded Successfully',
        dish,
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }
}
