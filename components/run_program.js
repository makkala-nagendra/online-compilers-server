import { exec } from "child_process";
import {writeCode, createDirectory, removeDirectory, isExists} from "./files_manager";
import { stderr, stdout } from "./event_listener";


export function runProgram(id, ws, path, code, lang){
    switch (lang){
        case "c":
            break;

        case "cpp":
            break;

        case "java":
            break;

        case "python":
            break;

        default:
            break;
              
    }
}


function compile(id, ws, path, fileName, extension, code, compileCMD, runCMD){
    filePath = path.join(path,`${fileName}.${extension}`);
    
    // Write code in temp file
    writeCode(filePath, code);

    // compile code
    exec(`${compileCMD} ${filePath}`,
    (error, stdout, stderr)=>{
        if(error){
            return false;
        }else{

            // run compiled code
            runCode(id, ws,path, fileName, compileCMD);
        }
    });
}

function runCode(id, ws, path, fileName, compileCMD){
    const process = exec(
        `${compileCMD}`,(error,stdout, stderr)=>{
            if(error){
                removeDirectory(path);
                ws.send(Json.strigify({error : stderr}));
                ws.close();
            }
        }
    );

    // process EventListener
}