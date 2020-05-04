"use strict";

import {
  Entity,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import User from "./User";
import ConversationMessage from "./ConversationMessage";

@Entity()
export default class Conversation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToMany(() => User, (user) => user.conversations, {
    cascade: true,
  })
  @JoinTable()
  users!: User[];

  @OneToMany(
    () => ConversationMessage,
    (conversationMessage) => conversationMessage.conversation,
    {
      onDelete: "CASCADE",
    },
  )
  messages!: ConversationMessage[];
}
