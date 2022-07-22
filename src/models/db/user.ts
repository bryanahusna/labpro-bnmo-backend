import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm"
import Transaction from "./transaction";

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

    @Column("bigint", {
        default: 0,
        transformer: {  // somehow the number is retrieved as a string so a transformer is needed
            from: (value) => parseInt(value),
            to: (value) => value
        }
    })
    balance!: number;

    @Column({ default: false })
    is_verified!: boolean;

    @Column({ default: false })
    is_admin!: boolean;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions!: Transaction[];

    //@OneToMany(() => Transfer, (transfer) => transfer.to_user)
    //in_transfers!: Transfer[];
}
