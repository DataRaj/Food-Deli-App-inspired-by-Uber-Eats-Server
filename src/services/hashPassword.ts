import * as bcrypt from 'bcrypt';

export class HashPasswordService {
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async comparehashPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}
