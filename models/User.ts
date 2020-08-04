import {
  Entity,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import {
  MinLength,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
  ValidateIf,
  IsNotEmpty,
} from "class-validator";
import Message from "./Message";
import Like from "./Like";
import Repost from "./Repost";
import Follow from "./Follow";
import Conversation from "./Conversation";
import ConversationMessage from "./ConversationMessage";
import Notification from "./Notification";
import { isNotEmptyString } from "../validators";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ unique: true })
  @MinLength(1)
  @isNotEmptyString()
  @MaxLength(24)
  username!: string;

  @Column({ nullable: true })
  @MaxLength(24)
  @isNotEmptyString()
  @IsOptional()
  displayname!: string;

  @MinLength(8)
  @IsOptional()
  @Column({ nullable: true, select: false })
  password!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(280)
  @isNotEmptyString()
  description!: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  @IsUrl()
  link!: string;

  @Column({ nullable: true, select: false })
  @IsOptional()
  githubId!: string;

  @Column({ nullable: true, select: false })
  @IsOptional()
  googleId!: string;

  @Column({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @isNotEmptyString()
  location!: string;

  @Column({ nullable: true, default: "blue" })
  color!: string;

  @OneToMany(() => Message, (message) => message.user, {
    onDelete: "CASCADE",
  })
  messages!: Message[];

  @OneToMany(() => Like, (like) => like.user, {
    onDelete: "CASCADE",
  })
  likes!: Like[];

  @OneToMany(
    () => ConversationMessage,
    (conversationMessage) => conversationMessage.user,
    {
      onDelete: "CASCADE",
    },
  )
  conversationMessages!: ConversationMessage[];

  @ManyToMany(() => Conversation)
  @JoinTable()
  conversations!: Conversation[];

  @OneToMany(() => Repost, (repost) => repost.user, {
    onDelete: "CASCADE",
  })
  reposts!: Repost[];

  @OneToMany(() => Follow, (follow) => follow.follower, {
    onDelete: "CASCADE",
  })
  following!: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following, {
    onDelete: "CASCADE",
  })
  followers!: Follow[];

  @OneToMany(() => Notification, (notification) => notification.targetUser, {
    onDelete: "CASCADE",
  })
  notifications!: Notification[];

  @OneToOne(() => Message, { onDelete: "CASCADE" })
  @JoinColumn()
  @IsOptional()
  pinned!: Message;
}
