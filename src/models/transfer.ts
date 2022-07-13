import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export default class Transfer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("bigint")
    amount!: number;

    @Column("datetime", { default: () => "NOW()" })
    completed_on!: string;

    @Column()
    from_user!: string;

    @Column()
    to_user!: string;
}
