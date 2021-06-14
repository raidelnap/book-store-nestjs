import { BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('user_details')
export class UserDetail extends BaseEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'varchar', length: 50, nullable: true})
    name: string;

    @Column({type: 'varchar', nullable: true})
    lastname: string;

    @Column({type: 'varchar', default: 'ACTIVE', length: 10})
    status: string;

    @CreateDateColumn({type: 'timestamp', name: 'created_at', nullable: true})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp', name: 'updated_at', nullable: true})
    updatedAt: Date;

}