import { Sequelize as Sequelize } from "sequelize-typescript";

import configLoader from "../config";
import * as path from "path";

const config = configLoader();

let sequelize: Sequelize;

export function getInstance(): Sequelize {
  if (!sequelize) {
    const {db} = config
    const connectionUri = `postgres://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`
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

export async function initialize(): Promise<Sequelize> {
  const sequelize = getInstance();
  await sequelize.sync({alter: true});
  return sequelize
}
