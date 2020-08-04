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
import { Message } from ".";

type Type = "follow" | "like" | "repost";

@Entity()
export default class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.notifications)
  targetUser!: User;

  @ManyToOne(() => User)
  originUser!: User;

  @Column()
  type!: Type;

  @ManyToOne(() => Message)
  message!: Message;

  @Column({ default: true })
  unread!: boolean;
}
