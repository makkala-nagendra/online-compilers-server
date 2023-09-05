import { randomBytes } from "crypto";

function getID(){
    // Generate unique user id
    return randomBytes(8).toString("hex");
}

export default getID;