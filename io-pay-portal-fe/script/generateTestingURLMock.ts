import { debug } from 'console';
import * as dotenv from 'dotenv';

import { getIdPaymentMock } from '../src/utils/testUtils';

dotenv.config();

const SRV_PORT = process.env.IOPAY_DEV_SERVER_PORT ? parseInt(process.env.IOPAY_DEV_SERVER_PORT, 10) : 1234;
const SRV_HOST = process.env.IOPAY_DEV_SERVER_HOST as string;

const PM_DOCK_HOST = process.env.PAYMENT_MANAGER_DOCKER_HOST as string;
const PM_DOCK_CTRL_PORT = process.env.PAYMENT_MANAGER_DOCKER_CONTROL_PORT
  ? parseInt(process.env.PAYMENT_MANAGER_DOCKER_CONTROL_PORT, 10)
  : 1234;

void getIdPaymentMock(PM_DOCK_HOST, PM_DOCK_CTRL_PORT.toString())
  .then(myIdPayment =>
    debug(`Please test on this local url: http://${SRV_HOST}:${SRV_PORT}/index.html?p=${myIdPayment}`),
  )
  .catch(e => debug(e));