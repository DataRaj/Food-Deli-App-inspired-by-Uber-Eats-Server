import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  iconImg: string;

  @Field(() => String, { nullable: true })
  @Column({ unique: true, nullable: true })
  @IsString()
  slug?: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
