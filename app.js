import { exec } from "child_process";
import { Server } from "ws";
const wss = new Server({ port: 8080 });
import { randomBytes } from "crypto";
import { existsSync, mkdirSync, writeFileSync, rm } from "fs";

// Change Local Paths
const path = "C:/Users/Name/Documents/Code/compilers/tmp"; // working Directory
const mcsPath = "cd C:\\program files\\Mono\\bin\\ &&";

// Create directory for compilers
if (!existsSync(path)) {
    mkdirSync(path);
}
 
console.log(`Server Started!..`);

// WebSocket Connection
wss.on("connection", (ws) => {
    var lang, code;
    ws.on("message", (message) => {

        // INPUT DATA
        const parts = JSON.parse(message);
        lang = parts.lang;
        code = parts.code;
        const id = generateUniqueId();
        var dir = `${path}/${id}`;

        // WebSocket error!
        ws.on("error", (_) => {
            removeDirectory(dir);
        });

        // WebSocket Close!
        ws.on("close", (_) => {
            removeDirectory(dir);
        });

        // Create directory for process
        if (!existsSync(dir)) {
            mkdirSync(dir);
        }

        // Remove WebSocket EventListener
        ws.removeEventListener("message");

        // SELECT LANGUAGE TO RUN
        switch (lang) {
            case "c":
                runCCode(ws, dir, code, id);
                break;
            case "cpp":
                runCPPCode(ws, dir, code, id);
                break;
            case "cs":
                runCSCode(ws, dir, code, id);
                break;
            case "java":
                runJavaCode(ws, dir, code, id);
                break;
            case "python":
                runPythonCode(ws, dir, code, id);
                break;
            default:
                ws.send("Unsupported language");
                break;
        }
    });
});

// C
function runCCode(ws, dir, code, id) {
    // Write the C code to a file
    writeFileSync(`${dir}/main.c`, code);
    // Compile Code
    exec(`gcc -o ${dir}/main ${dir}/main.c`, (err, stdout, stderr) => {
        if (err) {
            removeDirectory(dir);
            ws.send(JSON.stringify({ error: stderr }));
            ws.close();
            return;
        }
        // Run Code
        const process = exec(`cd ${dir} && .\\main`, (err, stdout, stderr) => {
            if (err) {
                removeDirectory(dir);
                ws.send(JSON.stringify({ error: stderr }));
                ws.close();
                return;
            }
        });

        // Process eventListener
        processEventListener(ws, dir, process, id);
    });
}

// C++
function runCPPCode(ws, dir, code, id) {
    // Write the C++ code to a file
    writeFileSync(`${dir}/main.cpp`, code);
    // Compile Code
    exec(`g++ -o ${dir}/main ${dir}/main.cpp`, (err, stdout, stderr) => {
        if (err) {
            removeDirectory(dir);
            ws.send(JSON.stringify({ error: stderr }));
            ws.close();
            return;
        }
        // Run Code
        const process = exec(`cd ${dir} && .\\main`, (err, stdout, stderr) => {
            if (err) {
                removeDirectory(dir);
                ws.send(JSON.stringify({ error: stderr }));
                ws.close();
                return;
            }
        });

        // Process eventListener
        processEventListener(ws, dir, process, id);
    });
}

// C#
function runCSCode(ws, dir, code, id) {
    // Write the C# code to a file
    writeFileSync(`${dir}/main.cs`, code);
    // Compile Code
    exec(
        `${mcsPath} mcs -out:${dir}/main.exe ${dir}/main.cs`,
        (err, stdout, stderr) => {
            if (err) {
                removeDirectory(dir);
                ws.send(JSON.stringify({ error: stderr }));
                ws.close();
                return;
            }
            // Run Code
            const process = exec(`cd ${dir} && .\\main`, (err, stdout, stderr) => {
                if (err) {
                    removeDirectory(dir);
                    ws.send(JSON.stringify({ error: stderr }));
                    ws.close();
                    return;
                }
            });

            // Process eventListener
            processEventListener(ws, dir, process, id);
        }
    );
}

// Java
function runJavaCode(ws, dir, code, id) {
    // Write the Java code to a file
    writeFileSync(`${dir}/MainClass.java`, code);

    // Compile Code
    exec(`javac ${dir}/MainClass.java`, (err, stdout, stderr) => {
        if (err) {
            removeDirectory(dir);
            ws.send(JSON.stringify({ error: stderr }));
            ws.close();
            return;
        }

        // Run Code
        const process = exec(
            `java -classpath ${dir} MainClass`,
            (err, stdout, stderr) => {
                if (err) {
                    removeDirectory(dir);
                    ws.send(JSON.stringify({ error: stderr }));
                    ws.close();
                    return;
                }
            }
        );

        // Process eventListener
        processEventListener(ws, dir, process, id);
    });
}

// Python
function runPythonCode(ws, dir, code, id) {
    // Write the Python code to a file
    writeFileSync(`${dir}/main.py`, code);
    // Run Code
    const process = exec(`python ${dir}/main.py`, (err, stdout, stderr) => {
        if (err) {
            removeDirectory(dir);
            ws.send(JSON.stringify({ error: stderr }));
            ws.close();
            return;
        }
    });
    // Process eventListener
    processEventListener(ws, dir, process, id);
}

// Process EventListener
function processEventListener(ws, dir, process, id) {
    ws.send(JSON.stringify({ output: `\\tmp\\${id}\>` }));
    // STDIN
    process.stdin.setEncoding("utf-8");
    // STDOUT
    process.stdout.on("data", (data) => {
        ws.send(JSON.stringify({ output: data }));
    });
    // STDERR
    process.stderr.on("data", (data) => {
        removeDirectory(dir);
        ws.send(JSON.stringify({ error: data }));
    });
    // Receive inputs
    ws.on("message", (input) => {
        // ws.send(JSON.stringify({ output: `>${input}` }));
        process.stdin.write(`${input}\n`);
    });

    // WebSocket error!
    ws.on("error", (_) => {
        process.kill();
        removeDirectory(dir);
    });

    // WebSocket Close!
    ws.on("close", (_) => {
        process.kill();
        removeDirectory(dir);
    });
    // Close the process
    process.on("exit", (code) => {
        removeDirectory(dir);
        ws.close();
    });
}

// Generate process Id
function generateUniqueId() {
    return randomBytes(8).toString("hex");
}

// Remove process files
function removeDirectory(dir) {
    rm(dir, { recursive: true }, (err) => {
        if (err) {
            return;
        }
    });
}
