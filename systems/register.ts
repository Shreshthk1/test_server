import { query } from "express";
import { Request } from "express-serve-static-core";
import { PoolConnection } from "mariadb";

export async function  register(userType :number, req: Request<{}, any, any, qs.ParsedQs, Record<string, any>>, databaseConnection: Promise<PoolConnection | undefined>){


    switch (userType) {
        case 0:
            let queryStatement :string =  "INSERT INTO myTable value (?,?)"

            const res = await databaseConnection

        break;

        case 1:

        break;
    }

}