"use strict";

import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";

import User from "./User";

@Entity()
export default class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((type) => User, (user) => user.following, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  following!: User;

  @ManyToOne((type) => User, (user) => user.followers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  follower!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
