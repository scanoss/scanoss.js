import { Component } from "../../shared/interfaces/Component";

export function chunkRequest(components: Component[], chunkSize: number): Array<Component[]> {
  const requests = [];
  for (let i = 0; i < components.length; i += chunkSize) {
    requests.push(components.slice(i, i + this.config.CHUNK_REQUEST_SIZE));
  }
  return requests;
}


export function validateComponents(components: Component[]): void {
  if (!components || components.length === 0) {
  throw new Error('Components array cannot be empty');
}

if (!Array.isArray(components)) {
  throw new Error('Components must be an array');
}

for (const component of components) {
  if (!component.purl || typeof component.purl !== 'string') {
    throw new Error('Each component must have a valid purl string');
  }
}
}
