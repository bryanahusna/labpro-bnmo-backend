import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity()
export default class User {
    @PrimaryColumn()
    username!: string;

    @Column("varchar", { length: 64 })
    password!: string;

    @Column("varchar", { length: 64 })
    hash_salt!: string;

    @Column()
    foto_ktp!: string;

    @Column()
    name!: string;

    @Column("bigint", { default: 0 })
    balance!: number;

    @Column({ default: false })
    is_verified!: boolean;

    @Column({ default: false })
    is_admin!: boolean;
}
