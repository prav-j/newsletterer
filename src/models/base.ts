import { Sequelize as Sequelize } from "sequelize-typescript";

import configLoader from "../config";
import * as path from "path";

const config = configLoader();

let sequelize: Sequelize;

export function getSequelizeInstance(): Sequelize {
  if (!sequelize) {
    const {db: connectionUri} = config
    sequelize = new Sequelize(connectionUri, {
      logging: false,
      pool: {
        min: 1,
        max: 20,
        idle: 10000
      }
    });
    sequelize.addModels([path.join(__dirname, '../modules/**/*.model.*')])
  }
  return sequelize;
}

export async function initializeDB(): Promise<Sequelize> {
  const sequelize = getSequelizeInstance();
  await sequelize.sync({alter: true});
  return sequelize
}

export async function resetDB(): Promise<Sequelize> {
  const sequelize = getSequelizeInstance();
  if (process.env.NODE_ENV !== 'test') {
    console.error('This WILL wipe out all data. Aborting. You may run this only in test mode.')
    return sequelize
  }
  await sequelize.sync({force: true});
  return sequelize
}
