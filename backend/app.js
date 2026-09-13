require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const graphqlHTTP = require("express-graphql").graphqlHTTP; // ES6

const graphQlSchema = require("./graphql/schema/graphQLschema");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/isAuthentication");

const app = express();

const PORT = process.env.PORT || 6921;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(bodyParser.json({ limit: "20mb" }));

app.use(isAuth);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: process.env.NODE_ENV !== "production",
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST || "cluster0.ofukhnj.mongodb.net"}/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
