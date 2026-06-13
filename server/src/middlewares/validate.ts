import { sValidator } from "@hono/standard-validator";
import { HTTPException } from "hono/http-exception";

export const validate = (target: 'json' | 'query' | 'param', schema: any) => {
    return sValidator(target, schema, (result) => {
        if (!result.success) {
            const errorMessage = result.error[0].message

            throw new HTTPException(400, { message: errorMessage })
        }
    })
}