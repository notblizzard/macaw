"use strict";

import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";

import User from "./User";
import Message from "./Message";

@Entity()
export default class Repost extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Message, (message) => message.reposts, {
    onDelete: "CASCADE",
  })
  message!: Message;
}
