import { Router } from "express";
// import { plainToClass } from 'class-transformer';
// import { validateObject } from '../utils/utils';
// import {Lead, LeadModel} from '../Model/Lead';
const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "TODO",
  });
});
// router.get('/lead', async(req,res) =>{
//     await LeadModel.find({}).then((data) => {
//         res.json(data);
//     }).catch((err) =>{
//         res.status(500).json(err);
//     });
// });
// router.get('/lead/:id', async(req,res) =>{
//     await LeadModel.findById({req.params.id})
// })
export default router;
