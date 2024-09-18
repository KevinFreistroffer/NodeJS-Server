# NodeServer

NodeJS and Express server, connected to a MongoDB database. View the Swagger docs to see the endpoints.

## Responses

Responses return the same structured data.

The `/src/defs/responses.ts` contains the function's returning the responses.
Examples:

```
{
...responses,
  caught_error: (error: any) => ({
    message: EMessageType.error,
    description: `Caught error: " ${
      error instanceof Error ? error.message : error
    }`,
    code: 1012,
    user: data,
  }),
  success: (user?: ISanitizedUser | ISanitizedUser[]) => ({
    message: EMessageType.success,
    description: "Success.",
    code: 2000,
    data: user,
  })
}
```

Used as:

```
const doc = await findOneById(123);
return res.json(responses.success(doc));
```

## Response codes

## Swagger

Visit: http://localhost:3000/api-docs/#/default
https://editor.swagger.io/

```

```
