import { Column, CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class Person {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @Column({
        nullable: true
    })
    firstname: string;

    @Column({
        nullable: true
    })
    lastname: string;

    @Column({
        default: true
    })
    active: boolean;

    @Index({ unique: true })
    @Column()
    email: string;

    @Column({
        nullable: true
    })
    phone: string;

    @Index({ unique: true })
    @Column({
        nullable: true,
        default: null
    })
    verification: string;

    @Index({ unique: true })
    @Column({
        nullable: true,
        default: null
    })
    code: string;

    @Index({ unique: true })
    @Column({
        nullable: true,
        default: null
    })
    phone: string;

    @Column({
        type: "timestamp",
        default: null,
        nullable: true
    })
    verifiedAt: Date;

    @Column({
        type: "timestamp",
        default: null,
        nullable: true
    })
    verifiedPhoneAt: Date;

    @Index({ unique: true })
    @Column({
        nullable: true,
        default: null
    })
    authToken: string;

    @Column({
        nullable: false,
        default: false
    })
    authTokenUsed: boolean;

    @Column({
        nullable: true,
        default: null
    })
    authTokenSent: Date;
}

export enum RegistrationSource {
    NORMAL,
    COOPERATION,
    OTHER
}