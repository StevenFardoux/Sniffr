import { Router } from "express";
import AuthRouter from "./AuthRoutes";
import UserRouter from "./UserRoutes";
import DevicesRouter from "./DeviceRoutes";
import GroupRouter from './GroupRoutes';
import DataRouter from './DataRoutes';


/*
* Grouping of routes in a single export file 
*/
const router = Router();


/*
* Mount all routes.
*/
router.use(AuthRouter);
router.use(UserRouter);
router.use(DevicesRouter);
router.use(GroupRouter);
router.use(DataRouter);


export default router;