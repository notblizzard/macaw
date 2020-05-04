import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "/uploads"));
  },
  filename(req, file, cb) {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});
export default multer({ storage });
