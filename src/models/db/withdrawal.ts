import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"
import Transaction from "./transaction";

@Entity()
export default class Withdrawal {
    @OneToOne(() => Transaction)
    @JoinColumn()
    transaction!: Transaction;

    @PrimaryColumn()
    transactionId!: number;

    @Column({ default: false })
    is_approved!: boolean;

    @Column("datetime", { default: null })
    approved_on!: Date;

}
