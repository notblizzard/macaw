"use strict";

import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { MinLength } from "class-validator";
import User from "./User";
import Conversation from "./Conversation";

@Entity()
export default class ConversationMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.conversationMessages, {
    onDelete: "CASCADE",
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: "CASCADE",
    nullable: true,
  })
  conversation: Conversation;

  @Column()
  @MinLength(1)
  data: string;
}
