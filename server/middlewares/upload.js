import multer from 'multer';

const storage=multer.diskStorage({
    destination:"uploads/",
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalName)
    }
})

export const upload = multer({storage});