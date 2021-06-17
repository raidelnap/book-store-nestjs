import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleRepository } from '../role/role.repository';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { status } from "../../shared/entity-status.enum";
import { ReadUserDto, UpdateUserDto } from './dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly _userRepository: UserRepository,
        @InjectRepository(RoleRepository)
        private readonly _roleRepository: RoleRepository
    ) { }

    async get(userId: number): Promise<ReadUserDto> {
        if (!userId) {
            throw new BadRequestException("id must be sent");
        }
        const user: User = await this._userRepository.findOne(userId, {
            where: { status: status.ACTIVE },
        });
        if (!user) {
            throw new NotFoundException();
        }
        return plainToClass(ReadUserDto, user);
    }

    async getAll(): Promise<ReadUserDto[]> {
        const users: User[] = await this._userRepository.find({
            where: { status: status.ACTIVE },
        });
        return users.map((user: User) => plainToClass(ReadUserDto, user));
    }

    async update(userId: number, user: UpdateUserDto): Promise<ReadUserDto> {
        const foundUser = await this._userRepository.findOne(userId, {
            where: { status: status.ACTIVE }
        });
        if (!foundUser) {
            throw new NotFoundException('User does not exists');
        }
        foundUser.username = user.username;
        const updatedUser = await this._userRepository.save(foundUser);
        return plainToClass(ReadUserDto, updatedUser);
    }

    async delete(userId: number): Promise<void> {
        const existsUser = await this._userRepository.findOne(userId, {
            where: { status: status.ACTIVE }
        });
        if (!existsUser) {
            throw new NotFoundException();
        }
        await this._userRepository.update(userId, { status: status.INACTIVE });
    }

    async setRoleToUser(userId: number, roleId: number): Promise<boolean> {
        const existsUser = await this._userRepository.findOne(userId, {
            where: { status: status.ACTIVE }
        });
        if (!existsUser) {
            throw new NotFoundException();
        }
        const existsRole = await this._roleRepository.findOne(roleId, {
            where: { status: status.ACTIVE }
        })
        if (!existsRole) {
            throw new NotFoundException("Role does not exists");
        }
        existsUser.roles.push(existsRole);
        await this._userRepository.save(existsUser);
        return true;
    }
}
