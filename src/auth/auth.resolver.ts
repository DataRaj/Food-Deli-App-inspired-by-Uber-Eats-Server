import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  createAccountInput,
  createAccountOutput,
  loginInput,
  loginOutput,
} from './auth.args';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  //init
  constructor(private readonly authService: AuthService) {}

  // sign up
  @Mutation(() => createAccountOutput)
  async createAccount(
    @Args('data') args: createAccountInput,
  ): Promise<createAccountOutput> {
    return await this.authService.createAccount(args);
  }

  // login
  @Mutation(() => loginOutput)
  async login(@Args('data') args: loginInput): Promise<loginOutput> {
    return await this.authService.login(args);
  }
}
