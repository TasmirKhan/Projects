export const sse = (event:string,data:unknown)=>`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
