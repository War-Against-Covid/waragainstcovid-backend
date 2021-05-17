import { Router } from 'express';
import { plainToClass } from 'class-transformer';
import { validateObject } from '../utils/utils';
import { User, UserModel } from '../Model/User';

const router = Router();

// Example on how to use class-transformer & class-validator with typegoose.
router.get('/test', async (req, res) => {
    const user = plainToClass(User, {
        name: 'test5',
        password: '1234',
    });
    req.log(user);
    await validateObject(user); // will fail
    const doc = await UserModel.create(user);
    req.log(doc);
    res.json({});
});

export default router;
