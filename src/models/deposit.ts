import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export default class Deposit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column("bigint")
    amount!: number;

    @Column({ default: false })
    is_approved!: boolean;

    @Column("datetime", { default: () => "NOW()" })
    request_on!: string;

    @Column("datetime")
    approved_on!: string;
}
