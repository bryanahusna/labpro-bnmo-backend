import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import User from "./user";

@Entity()
export default class Transfer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("bigint")
    amount!: number;

    @Column("datetime", { default: () => "NOW()" })
    completed_on!: Date;

    @ManyToOne(() => User, (from_user) => from_user.out_transfers)
    from_user!: User;

    @ManyToOne(() => User, (to_user) => to_user.in_transfers)
    to_user!: User;
}
