import { Component } from "../../shared/interfaces/Component";

export function chunkRequest(components: Component[], chunkSize: number): Array<Component[]> {
  const requests = [];
  for (let i = 0; i < components.length; i += chunkSize) {
    requests.push(components.slice(i, i + this.config.CHUNK_REQUEST_SIZE));
  }
  return requests;
}
