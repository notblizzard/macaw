import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1592256884898 implements MigrationInterface {
    name = 'InitialMigration1592256884898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "messageId" integer, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "repost" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "messageId" integer, CONSTRAINT "PK_abfcbb696914c514fca81f8cc0b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "data" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "file" character varying, "userId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "follow" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "followingId" integer, "followerId" integer, CONSTRAINT "PK_fda88bc28a84d2d6d06e19df6e5" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "conversation_message" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "data" character varying NOT NULL, "userId" integer, "conversationId" integer, CONSTRAINT "PK_2f8286c3560b52dba8428ac182e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "displayname" character varying, "password" character varying, "email" character varying NOT NULL, "description" character varying, "link" character varying, "githubId" character varying, "googleId" character varying, "location" character varying, "color" character varying DEFAULT 'blue', "pinnedId" integer, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_eb8ead2b46234e61294767a449" UNIQUE ("pinnedId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "conversation" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "user_conversations_conversation" ("userId" integer NOT NULL, "conversationId" integer NOT NULL, CONSTRAINT "PK_32949b370b6a6f3413bb1eda505" PRIMARY KEY ("userId", "conversationId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_25944e737d295aabbe9c3ea1ec" ON "user_conversations_conversation" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_005394704c1c42e3da287a7399" ON "user_conversations_conversation" ("conversationId") `, undefined);
        await queryRunner.query(`CREATE TABLE "conversation_users_user" ("conversationId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_39cd0ac92f269976929656be1d7" PRIMARY KEY ("conversationId", "userId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_7835ccf192c47ae47cd5c250d5" ON "conversation_users_user" ("conversationId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_b4d7dfd81d3b743bcfd1682abe" ON "conversation_users_user" ("userId") `, undefined);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_17347664a02bf3b8f8d6f7bb97c" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "repost" ADD CONSTRAINT "FK_d485b70d5447a47d8ebcb815920" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "repost" ADD CONSTRAINT "FK_b6ea3dd52ad536f80f67d69a837" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_e9f68503556c5d72a161ce38513" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "follow" ADD CONSTRAINT "FK_550dce89df9570f251b6af2665a" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_message" ADD CONSTRAINT "FK_ff1351ea6a73b268e1d9ddc4665" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_message" ADD CONSTRAINT "FK_b15f4550c3629ec9002803cfe20" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_eb8ead2b46234e61294767a449a" FOREIGN KEY ("pinnedId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user_conversations_conversation" ADD CONSTRAINT "FK_25944e737d295aabbe9c3ea1ecf" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "user_conversations_conversation" ADD CONSTRAINT "FK_005394704c1c42e3da287a73991" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_7835ccf192c47ae47cd5c250d5a" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_b4d7dfd81d3b743bcfd1682abeb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_b4d7dfd81d3b743bcfd1682abeb"`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_7835ccf192c47ae47cd5c250d5a"`, undefined);
        await queryRunner.query(`ALTER TABLE "user_conversations_conversation" DROP CONSTRAINT "FK_005394704c1c42e3da287a73991"`, undefined);
        await queryRunner.query(`ALTER TABLE "user_conversations_conversation" DROP CONSTRAINT "FK_25944e737d295aabbe9c3ea1ecf"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_eb8ead2b46234e61294767a449a"`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_message" DROP CONSTRAINT "FK_b15f4550c3629ec9002803cfe20"`, undefined);
        await queryRunner.query(`ALTER TABLE "conversation_message" DROP CONSTRAINT "FK_ff1351ea6a73b268e1d9ddc4665"`, undefined);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_550dce89df9570f251b6af2665a"`, undefined);
        await queryRunner.query(`ALTER TABLE "follow" DROP CONSTRAINT "FK_e9f68503556c5d72a161ce38513"`, undefined);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"`, undefined);
        await queryRunner.query(`ALTER TABLE "repost" DROP CONSTRAINT "FK_b6ea3dd52ad536f80f67d69a837"`, undefined);
        await queryRunner.query(`ALTER TABLE "repost" DROP CONSTRAINT "FK_d485b70d5447a47d8ebcb815920"`, undefined);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_17347664a02bf3b8f8d6f7bb97c"`, undefined);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_b4d7dfd81d3b743bcfd1682abe"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_7835ccf192c47ae47cd5c250d5"`, undefined);
        await queryRunner.query(`DROP TABLE "conversation_users_user"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_005394704c1c42e3da287a7399"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_25944e737d295aabbe9c3ea1ec"`, undefined);
        await queryRunner.query(`DROP TABLE "user_conversations_conversation"`, undefined);
        await queryRunner.query(`DROP TABLE "conversation"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "conversation_message"`, undefined);
        await queryRunner.query(`DROP TABLE "follow"`, undefined);
        await queryRunner.query(`DROP TABLE "message"`, undefined);
        await queryRunner.query(`DROP TABLE "repost"`, undefined);
        await queryRunner.query(`DROP TABLE "like"`, undefined);
    }

}
