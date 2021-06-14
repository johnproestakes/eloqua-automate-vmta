export function EloquaCredentials(username: string, password: string) {
  return "Basic " + Buffer.from(username + ":" + password).toString("base64");
}
