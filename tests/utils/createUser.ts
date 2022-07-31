import bcrypt from 'bcrypt';
import appconfig from '../../src/appconfig';
import AppDataSource from '../../src/db';
import User, { createJWT } from '../../src/models/db/user';

type UserOptions = {
    username: string,
    password: string,
    name: string,
    foto_ktp: string,
    is_admin?: boolean,
    is_verified?: boolean,
    balance?: number
}

const userRepository = AppDataSource.getRepository(User);

/** Return the JWT token */
export default async function createUser(user: UserOptions): Promise<string>{
    const hash_salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, hash_salt);
    const userDb = await userRepository.save(user);
    return createJWT(userDb, appconfig.get("JWT_PRIVATEKEY") || '');
}

export async function createVerifiedUser(user: UserOptions): Promise<string>{
    user.is_verified = true;
    return createUser(user);
}
