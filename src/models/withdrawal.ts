import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export default class Withdrawal {
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

    @Column("datetime", { default: null })
    approved_on!: string;
}
