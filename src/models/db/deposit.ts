import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export default class Deposit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column({
        type: 'bigint',
        transformer: {
            from: (value) => parseInt(value),
            to: (value) => value
        }
    })  // somehow the number retrieved as a string so a transformer is needed
    amount!: number;

    @Column({ default: false })
    is_approved!: boolean;

    @Column("datetime", { default: () => "NOW()" })
    request_on!: Date;

    @Column("datetime", { default: null })
    approved_on!: Date;
}
