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
export default class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Message, (message) => message.likes, {
    onDelete: "CASCADE",
  })
  message!: Message;

  @CreateDateColumn()
  createdAt!: Date;
}
