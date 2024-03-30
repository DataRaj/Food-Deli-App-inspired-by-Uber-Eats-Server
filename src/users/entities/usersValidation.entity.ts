import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '../../common/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class UsersValidation extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = Math.random().toString(36);
  }
}
