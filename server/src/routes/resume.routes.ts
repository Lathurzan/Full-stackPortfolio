import { Router } from "express";
import multer from "multer";

import {
 uploadResume,
 getResume,
 proxyResume,
 deleteResume
} from "../controllers/resume.controller.js";


const router = Router();


const upload = multer({
 dest:"tmp/"
});


router.post(
 "/",
 upload.single("file"),
 uploadResume
);


router.get(
 "/",
 getResume
);

router.get(
 "/proxy",
 proxyResume
);


router.delete(
 "/",
 deleteResume
);


export default router;