const express = require('express');
require('envdotjson').load();
require('express-async-errors');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerSpec = YAML.load('./swagger/swagger.yaml');
const routes = require('./routes');
const { connectToDB } = require('./utils/db');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

process.on('uncaughtException', e => {
  logger.error(e.message);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', e => {
  logger.error(e.message);
  setTimeout(() => process.exit(1), 1000);
});

const app = express();
const PORT = process.env.PORT || 3000;
const morganLvl = process.env.NODE_ENV === 'production' ? 'short' : 'dev';
const morganLog = morgan(morganLvl, { stream: logger.stream });

app.use('/test-report', express.static('coverage/lcov-report'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(cors());
app.use(morganLog);
app.use(express.json());
app.use('/v1', routes);
app.use(errorHandler);

connectToDB()
  .then(() => {
    logger.info('DB connected');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        logger.info(`Server is listening on PORT: ${PORT}`);
      });
    }
  })
  .catch(e => {
    logger.error('DB connection failed');
    throw new Error(e);
  });

module.exports = app;
