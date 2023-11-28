import {Sequelize} from 'sequelize'
import { readFile } from 'fs/promises';
const json = JSON.parse(
  await readFile(
    new URL('../config/config.json', import.meta.url)
  )
);
const env = process.env.NODE_ENV || 'development';

const config = json[env]

export let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

