import { existsSync, mkdirSync, writeFileSync, rm } from "fs";


export function writeCode(path, code){
    writeFileSync(path, code);
}

export function removeDirectory(path){
    rm(path,(error)={
        if(error){
            console.log("createDirectory : "+error);
        }
    });
}

export function createDirectory(path){
    mkdirSync(path);
}

export function isExists(path) {
    existsSync(path)
}