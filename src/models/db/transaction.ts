import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Deposit from "./deposit";
import Transfer from "./transfer";
import User from "./user";
import Withdrawal from "./withdrawal";

export enum TransactionType {
    Deposit = 'deposit',
    Withdrawal = 'withdrawal',
    Transfer = 'transfer',
    Unknown = 'unknown'
};

@Entity()
export default class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({
        type: 'bigint',
        transformer: {
            from: (value) => parseInt(value),
            to: (value) => value
        }
    })  // somehow the number retrieved as a string so a transformer is needed
    amount!: number;
    
    @ManyToOne(() => User, (user) => user.transactions)
    user!: User;

    @Column("datetime", { default: () => "NOW()" })
    made_on!: Date;

    @Column({
        type: "enum",
        enum: TransactionType,
        default: TransactionType.Unknown
    })
    type!: TransactionType;

    @OneToOne(() => Deposit, (deposit) => deposit.transaction)
    deposit?: Deposit;

    @OneToOne(() => Withdrawal, (withdrawal) => withdrawal.transaction)
    withdrawal?: Withdrawal;

    @OneToOne(() => Transfer, (transfer) => transfer.transaction)
    transfer?: Transfer;
}
