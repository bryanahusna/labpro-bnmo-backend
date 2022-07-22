import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm"
import Transaction from "./transaction";
import User from "./user";

@Entity()
export default class Transfer {
    @OneToOne(() => Transaction)
    @JoinColumn()
    transaction!: Transaction;

    @PrimaryColumn()
    transactionId!: number;

    @ManyToOne(() => User)
    to_user!: User;
    
}
