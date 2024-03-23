import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @UpdateDateColumn()
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
