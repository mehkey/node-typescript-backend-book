import "reflect-metadata";
import "dotenv-safe/config";
import { __prod__, COOKIE_NAME } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";

import { ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';

import cors from "cors";




const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    // migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User],
  });

  //await conn.runMigrations();

  // await Post.delete({});

  const app = express();

  

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
      
    }),
    debug: process.env.NODE_DEV === 'development',
    context: ({ req, res }) => ({
      req,
      res
    }),
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ]
    
  });
  
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log("server started on localhost:process.env.PORT");
  });
};

main().catch((err) => {
  console.error(err);
});
