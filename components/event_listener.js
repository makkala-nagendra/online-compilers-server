import { removeDirectory } from "./files_manager";

export default function eventListener(id, ws, path, process){
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