const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const bodyParser = require('body-parser');
const schema = require('./schema');
const logger = require('./utils/logger');
const { serverPort, environment } = require('./config/config')


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    req.headers['access-token'] ? next() : res.sendStatus(401);
});

app.use('/graphql', graphqlHTTP({
    graphiql: environment !== 'production',
    schema: schema,
    customFormatErrorFn: err => {
        logger.error(`Graphql error: ${err.message}`)
        return { message: err.message, status: err.originalError?.code || 500 };
    }
}));

app.listen(serverPort, () => {
    logger.info(`Server started on ${serverPort}...`);
});
