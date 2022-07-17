import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm"
import Transfer from "./transfer";

@Entity()
export default class User {
    @PrimaryColumn()
    username!: string;

    @Column("varchar", { length: 64 })
    password!: string;

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

    @OneToMany(() => Transfer, (transfer) => transfer.from_user)
    out_transfers!: Transfer[];

    @OneToMany(() => Transfer, (transfer) => transfer.to_user)
    in_transfers!: Transfer[];
}
