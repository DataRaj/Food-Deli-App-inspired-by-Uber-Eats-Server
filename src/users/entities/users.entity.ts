import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/core.entity';
import { HashPasswordService } from '../../services/hashPassword';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { Order } from 'src/orders/entities/orders.entity';
// import { Payment } from '../../payments/entities/payments.entity';
export enum UserRole {
  Owner = 'Owner',
  Client = 'Client',
  Delivery = 'Delivery',
  Admin = 'Admin',
}

@InputType('AddressItemObjectType', { isAbstract: true })
@ObjectType()
export class AddressItem {
  @PrimaryGeneratedColumn()
  @Field(() => String)
  id: string;
  @Field(() => String)
  address: string;
  @Field(() => String)
  apartment: string;
  @Field(() => Number)
  postalCode: number;
  @Field(() => String)
  region: string;
  @Field(() => String)
  city: string;
}

registerEnumType(UserRole, { name: 'UserRole' });
@InputType('UserInput', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  firstName: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  lastName: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  mobile: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  @Length(3, 20)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @Column('json', { nullable: true })
  @Field(() => [AddressItem], { nullable: true })
  address?: AddressItem[];

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  // @Field(() => [Payment])
  // @OneToMany(() => Payment, (payment) => payment.user)
  // payments: Payment[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.driver)
  rides: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashingPassword(): Promise<void> {
    this.password &&
      (this.password = await new HashPasswordService().hashPassword(
        this.password,
      ));
  }
}
