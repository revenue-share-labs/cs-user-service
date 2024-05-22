import { UserDto } from './user.dto';
import { UserCreationStrategy, UserRole, WalletProvider } from '@prisma/client';

describe('UserDto', () => {
  it('check fields of dto.', async () => {
    const userDto: UserDto = {
      id: 'test123',
      email: 'test@gmail.com',
      username: 'username',
      createdBy: UserCreationStrategy.EMAIL,
      firstName: 'Name',
      lastName: 'Test',
      wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
      activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
      apiKey: '123',
      roles: [UserRole.CUSTOMER],
    };
    expect({
      id: 'test123',
      email: 'test@gmail.com',
      username: 'username',
      createdBy: UserCreationStrategy.EMAIL,
      firstName: 'Name',
      lastName: 'Test',
      wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
      activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
      apiKey: '123',
      roles: [UserRole.CUSTOMER],
    }).toEqual(userDto);
  });
  it('check instanceof dto.', () => {
    const tokenPayloadDto = new UserDto();
    expect(tokenPayloadDto).toBeInstanceOf(UserDto);
  });
});
