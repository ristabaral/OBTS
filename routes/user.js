import express from 'express';
const router = express.Router();

import { loginController, scheduleController, homeController } from '../controllers';
import { auth, operator, admin } from '../middlewares';


// Homepage
router.get('/', homeController.index);
router.post('/', scheduleController.search);
// router.get('/availableroutes', homeController.chooseRoute);

router.get('/login', loginController.loginPage);

export default router;