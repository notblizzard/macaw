"use strict";

import {
  Entity,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { MinLength, MaxLength, IsString, IsOptional } from "class-validator";
import User from "./User";
import Like from "./Like";
import Repost from "./Repost";

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @MinLength(1)
  @MaxLength(280)
  data!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  file!: string;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
  })
  user!: User;

  @OneToMany(() => Like, (like) => like.message, {
    onDelete: "CASCADE",
  })
  likes!: Like[];

  @OneToMany(() => Repost, (repost) => repost.message, {
    onDelete: "CASCADE",
  })
  reposts!: Repost[];

  @Column({ nullable: true })
  userId!: number;
}
