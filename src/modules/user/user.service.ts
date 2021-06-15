import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection } from 'typeorm';
import { Role } from '../role/role.entity';
import { RoleRepository } from '../role/role.repository';
import { UserDetail } from './user.details.entity';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { status } from "../../shared/entity-status.enum";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly _userRepository: UserRepository,
        @InjectRepository(RoleRepository)
        private readonly _roleRepository: RoleRepository
    ) { }

    async get(id: number): Promise<User> {
        if (!id) {
            throw new BadRequestException("id must be sent");
        }

        const user: User = await this._userRepository.findOne(id, {
            where: { status: status.ACTIVE },
        });

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async getAll(): Promise<User[]> {
        const users: User[] = await this._userRepository.find({
            where: { status: status.ACTIVE },
        });

        return users;
    }

    async create(user: User): Promise<User> {
        const details = new UserDetail();
        user.details = details;

        const repo = await getConnection().getRepository(Role);
        const defaultRole = await repo.findOne({ where: { name: 'GENERAL' } });
        user.roles = [defaultRole];
        const savedUser = await this._userRepository.save(user);
        return savedUser;
    }

    async update(id: number, user: User): Promise<void> {
        await this._userRepository.update(id, user);
    }

    async delete(id: number): Promise<void> {
        const existsUser = await this._userRepository.findOne(id, {
            where: { status: status.ACTIVE }
        });

        if (!existsUser) {
            throw new NotFoundException();
        }

        await this._userRepository.update(id, { status: status.INACTIVE });
    }

    async setRoleToUser(userId: number, roleId: number) {
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
