import { Transport } from '../api/transport';
import { Http } from '../api/transport/Http';
import { DependencyNamespace } from '../namespaces/Dependency.namespace';

export class ScanossSDK {
  public readonly dependencies: DependencyNamespace;

  private transport: Transport;

  constructor(t: Transport | null) {
    if (t == null) this.transport = new Http();

    // Initialize namespaces
    this.dependencies = new DependencyNamespace(this.transport);
  }

}
