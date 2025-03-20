import express from 'express';
import multer from 'multer';
import path from 'path';
import ImageController from '../controllers/ImageController';
const imageRoute = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
imageRoute.get('/:id', ImageController.getImageById);
imageRoute.post('/', ImageController.uploadImage);
export default imageRoute;
