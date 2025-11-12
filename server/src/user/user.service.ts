import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {
  }

  async getUserBySub({ sub }: { sub: string }) {
    return this.userRepository.getUserBySub({ sub });
  }
}
